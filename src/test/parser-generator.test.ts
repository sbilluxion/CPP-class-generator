import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseClass } from '../parser';
import { generateClass } from '../generator';

test('slash-separated and multiline descriptions produce the same model', () => {
    const expected = { name: 'Student', fields: [
        { name: 'name', type: 'string' }, { name: 'age', type: 'int' }
    ] };
    assert.deepEqual(parseClass('class Student / name: string / age: int'), expected);
    assert.deepEqual(parseClass('\r\n class Student\r\n\r\n name: string\r\n age: int\r\n'), expected);
});

test('generates initialized fields and the string header once', () => {
    assert.equal(generateClass(parseClass('class Student / name: string / age: int')),
        `#include <string>

class Student {
public:
    std::string name{};
    int age{};

    const std::string& getName() const {
        return this->name;
    }

    void setName(const std::string& value) {
        this->name = value;
    }

    int getAge() const {
        return this->age;
    }

    void setAge(int value) {
        this->age = value;
    }
};`);
    const code = generateClass(parseClass('class Names / first: string / last: std::string'));
    assert.equal(code.match(/#include/g)?.length, 1);
});

test('supports empty classes and scalar types without includes', () => {
    assert.equal(generateClass(parseClass('class Empty')), 'class Empty {\n};');
    const types = ['int', 'float', 'double', 'bool', 'char', 'short', 'long', 'long long', 'unsigned int'];
    for (const type of types) {
        assert.equal(generateClass(parseClass(`class Value / value: ${type}`)),
            `class Value {\npublic:\n    ${type} value{};\n\n    ${type} getValue() const {\n        return this->value;\n    }\n\n    void setValue(${type} value) {\n        this->value = value;\n    }\n};`);
    }
});

test('rejects invalid descriptions instead of silently discarding data', () => {
    const invalid = ['', 'Student', 'class 12Student', 'class class', 'class _Reserved',
        'class A / value int', 'class A / value:', 'class A / value: mystery',
        'class A / int: int', 'class A / A: int', 'class A / a__b: int',
        'class A / x: int / x: string', 'class A / x: int; injected()',
        'class A / class B'];
    for (const text of invalid) {
        assert.throws(() => parseClass(text), Error, text);
    }
});

test('rejects accessor name collisions', () => {
    for (const text of [
        'class A / age: int / Age: int',
        'class A / age: int / getAge: int',
        'class A / setAge: int / age: int',
        'class getAge / age: int',
        'class setAge / age: int'
    ]) {
        assert.throws(() => generateClass(parseClass(text)), /конфликтует/);
    }
});
