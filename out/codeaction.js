"use strict";
/**
 * Defines `CodespellCodeAction` class.
 *
 * `CodespellTypo` makes `CodespellDiagnostic` makes `CodespellCodeAction`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodespellCodeAction = void 0;
const vscode = require("vscode");
const diagnostics_1 = require("./diagnostics");
/**
 * Provides code actions for the commands of `vscode-codespell.fixTypo` and
 * `vscode-codespell.fixAllTypos`.
 */
class CodespellCodeAction {
    provideCodeActions(document, _range, context, _token) {
        let actions = [];
        const ignores = [];
        const codespellDiagnostics = context.diagnostics.filter((diagnostic) => diagnostic.code === diagnostics_1.CODE_SPELL_MENTION);
        if (!codespellDiagnostics.length) {
            return [];
        }
        codespellDiagnostics.forEach((diagnostic) => {
            actions = actions.concat(this.createFixTypoCommandCodeActions(diagnostic, document));
        });
        actions = actions.concat(ignores);
        if (!actions.length) {
            return actions;
        }
        if (codespellDiagnostics.some((diagnostic) => diagnostic.typo.isCommon === true)) {
            const action = new vscode.CodeAction('quick fix', vscode.CodeActionKind.QuickFix);
            action.command = {
                command: 'vscode-codespell.fixCommonTypos',
                title: 'Fix common typos',
                arguments: [{ document }],
            };
            actions.push(action);
        }
        return actions;
    }
    createFixTypoCommandCodeActions(diagnostic, document) {
        const actions = [];
        diagnostic.suggestions.forEach((suggestion) => {
            const action = new vscode.CodeAction(`⤷ ${suggestion}`, vscode.CodeActionKind.QuickFix);
            action.command = {
                command: 'vscode-codespell.fixTypo',
                title: 'Fix a typo',
                arguments: [
                    {
                        document,
                        suggestion,
                        token: diagnostic.token,
                        range: diagnostic.range,
                    },
                ],
            };
            actions.push(action);
        });
        if (actions.length) {
            actions[0].isPreferred = true;
        }
        return actions;
    }
}
exports.CodespellCodeAction = CodespellCodeAction;
CodespellCodeAction.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
];
//# sourceMappingURL=codeaction.js.map