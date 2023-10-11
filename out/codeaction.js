"use strict";
/**
 * Defines `CodesmellCodeAction` class.
 *
 * `CodesmellTypo` makes `CodesmellDiagnostic` makes `CodesmellCodeAction`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesmellCodeAction = void 0;
const vscode = require("vscode");
const diagnostics_1 = require("./diagnostics");
/**
 * Provides code actions for the commands of `vscode-code-smell-gpt.fixTypo` and
 * `vscode-code-smell-gpt.fixAllTypos`.
 */
class CodesmellCodeAction {
    provideCodeActions(document, _range, context, _token) {
        let actions = [];
        const ignores = [];
        const CodesmellDiagnostics = context.diagnostics.filter((diagnostic) => diagnostic.code === diagnostics_1.CODE_SMELL_MENTION);
        if (!CodesmellDiagnostics.length) {
            return [];
        }
        CodesmellDiagnostics.forEach((diagnostic) => {
            actions = actions.concat(this.createFixTypoCommandCodeActions(diagnostic, document));
        });
        actions = actions.concat(ignores);
        if (!actions.length) {
            return actions;
        }
        if (CodesmellDiagnostics.some((diagnostic) => diagnostic.typo.isCommon === true)) {
            const action = new vscode.CodeAction('quick fix', vscode.CodeActionKind.QuickFix);
            action.command = {
                command: 'vscode-code-smell-gpt.fixCommonTypos',
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
            const action = new vscode.CodeAction(`Code Smell Suggest: ⤷ ${suggestion}`, vscode.CodeActionKind.QuickFix);
            action.command = {
                command: 'vscode-code-smell-gpt.fixTypo',
                title: 'Fix it',
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
exports.CodesmellCodeAction = CodesmellCodeAction;
CodesmellCodeAction.providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
];
//# sourceMappingURL=codeaction.js.map