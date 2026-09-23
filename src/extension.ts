import * as vscode from 'vscode';
import { parseClass } from './parser';
import { generateClass } from './generator';

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand(
        'classGenerator.generate',
        async () => {

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage('Нет открытого редактора');
                return;
            }

            const selection = editor.selection;

            const text = editor.document.getText(selection);

            if (!text.trim()) {
                vscode.window.showErrorMessage(
                    'Сначала выделите описание класса'
                );
                return;
            }

            try {
                const eol = editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n';
                const documentText = editor.document.getText();
                const surroundingText = documentText.slice(0, editor.document.offsetAt(selection.start))
                    + documentText.slice(editor.document.offsetAt(selection.end));
                const generatedCode = generateClass(parseClass(text), surroundingText).replace(/\n/g, eol);
                const applied = await editor.edit(editBuilder => {
                    editBuilder.replace(selection, generatedCode);
                });
                if (!applied) {
                    void vscode.window.showErrorMessage('Не удалось заменить выделение. Повторите команду.');
                }
            } catch (error) {
                void vscode.window.showErrorMessage(
                    error instanceof Error ? error.message : 'Не удалось сгенерировать класс'
                );
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
