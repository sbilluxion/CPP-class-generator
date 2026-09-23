import { ClassInfo } from './models/ClassInfo';
import { cppTypes, isCppIdentifier } from './cpp';

export function parseClass(text: string): ClassInfo {
    const parts = text.split(/\r?\n|\//).map(part => part.trim()).filter(Boolean);
    const header = /^class\s+([A-Za-z_][A-Za-z0-9_]*)$/.exec(parts[0] ?? '');
    if (!header || !isCppIdentifier(header[1])) {
        throw new Error('Описание должно начинаться с class и допустимого имени, например: class Student');
    }

    const result: ClassInfo = { name: header[1], fields: [] };
    const names = new Set<string>();
    for (const part of parts.slice(1)) {
        const match = /^([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(.+)$/.exec(part);
        if (!match) {
            throw new Error(`Некорректное поле «${part}». Ожидается имя: тип`);
        }
        const [, name, rawType] = match;
        const normalizedType = rawType.trim().replace(/\s+/g, ' ');
        const modifier = / (public|private)$/.exec(normalizedType);
        const access = modifier?.[1] === 'private' ? 'private' : 'public';
        const type = modifier ? normalizedType.slice(0, modifier.index) : normalizedType;
        if (!isCppIdentifier(name) || name === result.name) {
            throw new Error(`Недопустимое имя поля «${name}»`);
        }
        if (names.has(name)) {
            throw new Error(`Поле «${name}» указано несколько раз`);
        }
        if (!cppTypes.has(type)) {
            throw new Error(`Неизвестный тип «${type}». Поддерживаются: ${[...cppTypes.keys()].join(', ')}`);
        }
        names.add(name);
        result.fields.push({ name, type, access });
    }
    return result;
}
