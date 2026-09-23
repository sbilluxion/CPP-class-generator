import { ClassInfo } from './models/ClassInfo';
import { cppTypes } from './cpp';

export function generateClass(info: ClassInfo): string {
    const memberNames = new Set([info.name, ...info.fields.map(field => field.name)]);
    const methods: string[] = [];
    const fields = info.fields.map(field => {
        const type = cppTypes.get(field.type);
        if (!type) {
            throw new Error(`Неизвестный тип «${field.type}»`);
        }
        const suffix = field.name[0].toUpperCase() + field.name.slice(1);
        const getter = `get${suffix}`;
        const setter = `set${suffix}`;
        for (const name of [getter, setter]) {
            if (memberNames.has(name)) {
                throw new Error(`Имя метода «${name}» конфликтует с именем класса, поля или другого метода`);
            }
            memberNames.add(name);
        }
        const valueType = type === 'std::string' ? 'const std::string&' : type;
        methods.push(
            '',
            `    ${valueType} ${getter}() const {`,
            `        return this->${field.name};`,
            '    }',
            '',
            `    void ${setter}(${valueType} value) {`,
            `        this->${field.name} = value;`,
            '    }'
        );
        return `    ${type} ${field.name}{};`;
    });
    const needsString = info.fields.some(field => cppTypes.get(field.type) === 'std::string');
    const lines = needsString ? ['#include <string>', ''] : [];
    lines.push(`class ${info.name} {`);
    if (fields.length > 0) {
        lines.push('public:', ...fields, ...methods);
    }
    lines.push('};');
    return lines.join('\n');
}
