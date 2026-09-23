import * as assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseClass } from '../parser';
import { generateClass } from '../generator';

test('adds string include only when missing for all string aliases', () => {
    for (const type of ['str', 'string', 'std::string']) {
        const info = parseClass(`class Student / name: ${type}`);
        for (const existing of ['#include <string>\n', '  # include<string> // strings\r\n',
            '#include /* strings */ <string>\n']) {
            assert.ok(!generateClass(info, existing).includes('#include'));
        }
        for (const existing of ['', '#include <string_view>\n', '// #include <string>\n',
            '/*\n#include <string>\n*/', 'const char* s = R"(\n#include <string>\n)";']) {
            assert.ok(generateClass(info, existing).startsWith('#include <string>\n'));
        }
    }
});

test('slash-separated and multiline descriptions produce the same model', () => {
    const expected = { name: 'Student', fields: [
        { name: 'name', type: 'string', access: 'public' }, { name: 'age', type: 'int', access: 'public' }
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

test('parses access modifiers including multiword types and default public', () => {
    assert.deepEqual(parseClass('class Student / name: str private / age: unsigned int public / count: long long').fields, [
        { name: 'name', type: 'str', access: 'private' },
        { name: 'age', type: 'unsigned int', access: 'public' },
        { name: 'count', type: 'long long', access: 'public' }
    ]);
    for (const suffix of ['protected', 'private public', 'public private']) {
        assert.throws(() => parseClass(`class A / value: int ${suffix}`));
    }
});

test('groups fields by access and keeps accessors public', () => {
    const code = generateClass(parseClass('class Student / age: int public / name: string private / count: int'));
    assert.ok(code.includes('private:\n    std::string name{};\n\npublic:\n    int age{};\n    int count{};'));
    assert.ok(code.indexOf('getName() const') > code.indexOf('public:'));
    assert.ok(code.indexOf('setName(') > code.indexOf('public:'));
    const privateOnly = generateClass(parseClass('class Value / value: int private'));
    assert.ok(privateOnly.includes('private:\n    int value{};\n\npublic:'));
    assert.ok(privateOnly.indexOf('getValue() const') > privateOnly.indexOf('public:'));
});
