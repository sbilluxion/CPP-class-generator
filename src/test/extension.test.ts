import * as assert from 'assert';
import * as vscode from 'vscode';
import { generateClass } from '../generator';
import { parseClass } from '../parser';

suite('Class generation command', () => {
    test('replaces only the selection and supports undo', async () => {
        const description = 'class Student / name: string / age: int';
        const original = `// Before\n${description}\n// After\n`;
        const document = await vscode.workspace.openTextDocument({ content: original, language: 'cpp' });
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(1, 0, 1, description.length);
        await vscode.commands.executeCommand('classGenerator.generate');
        assert.strictEqual(document.getText(),
            `// Before\n${generateClass(parseClass(description))}\n// After\n`);
        await vscode.commands.executeCommand('undo');
        assert.strictEqual(document.getText(), original);
    });

    test('invalid input is preserved', async () => {
        const original = 'class Student / age: unknown';
        const document = await vscode.workspace.openTextDocument({ content: original });
        const editor = await vscode.window.showTextDocument(document);
        editor.selection = new vscode.Selection(0, 0, 0, original.length);
        await vscode.commands.executeCommand('classGenerator.generate');
        assert.strictEqual(document.getText(), original);
    });
});
