import { ClassInfo } from './models/ClassInfo';
import { cppTypes } from './cpp';

export function generateClass(info: ClassInfo): string {
    const fields = info.fields.map(field => {
        const type = cppTypes.get(field.type);
        if (!type) {
            throw new Error(`Неизвестный тип «${field.type}»`);
        }
        return `    ${type} ${field.name}{};`;
    });
    const needsString = info.fields.some(field => cppTypes.get(field.type) === 'std::string');
    const lines = needsString ? ['#include <string>', ''] : [];
    lines.push(`class ${info.name} {`);
    if (fields.length > 0) {
        lines.push('public:', ...fields);
    }
    lines.push('};');
    return lines.join('\n');
}
