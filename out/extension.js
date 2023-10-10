"use strict";
/**
 * Defines the functions for the code action commands, and registers all the
 * commands and `refreshDiagnostics`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const spellcheck_1 = require("./spellcheck");
const ignore_1 = require("./ignore");
const history_1 = require("./history");
const codeaction_1 = require("./codeaction");
const spellcheck_commands_1 = require("./spellcheck-commands");
const diagnostics_1 = require("./diagnostics");
const chat_1 = require("./chat");
/** Called once the extension is activated. */
function activate(context) {
    history_1.CodespellHistory.backupIfTooLarge();
    const userGPTKey = vscode.workspace.getConfiguration('vscode-codespell').get('gptKey');
    if (userGPTKey) {
        chat_1.initChat(userGPTKey);
    }
    else {
        vscode.window.showInformationMessage(`Please config your gpt key first!`);
    }
    // Subscribes `refreshDiagnostics` to documents change events.
    diagnostics_1.subscribeDiagnosticsToDocumentChanges(context);
    // Registers the code actions for `vscode-codespell.fixTypo`,
    // `vscode-codespell.fixAllTypos`, and `vscode-codespell.fixCommonTypos`.
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('*', new codeaction_1.CodespellCodeAction(), { providedCodeActionKinds: codeaction_1.CodespellCodeAction.providedCodeActionKinds }));
    // Binds code action commands to corresponding functions.
    context.subscriptions.push(vscode.commands.registerCommand('vscode-codespell.fixTypo', fixTypo));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-codespell.ignoreTypo', ignoreTypo));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-codespell.fixAllTypos', fixAllTypos));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-codespell.fixCommonTypos', fixCommonTypos));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-codespell.spellCheckByAll', spellcheck_commands_1.spellCheckByAll));
}
exports.activate = activate;
/**
 * Fixes the typo of the given range of the document.
 *
 * Called by `vscode-codespell.fixTypo` code action command.
 */
function fixTypo(args) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(args.document.uri, args.range, args.suggestion);
    history_1.CodespellHistory.writeOnce(`${args.token} -> ${args.suggestion}\n`);
    vscode.workspace.applyEdit(edit);
}
/**
 * Adds given token to `~/.codespell-ignore`).
 *
 * Called by `vscode-codespell.ignoreTypo` code action command.
 */
function ignoreTypo(args) {
    ignore_1.CodespellIgnore.append(args.token);
    const typos = spellcheck_1.DocumentsToTypos.getTypos(args.document);
    spellcheck_1.DocumentsToTypos.setTypos(args.document, typos.filter((typo) => typo.token !== args.token));
    diagnostics_1.refreshDiagnostics(args.document);
}
/**
 * Fixes all the typos of the document.
 *
 * Called by `vscode-codespell.fixAllTypos` code action command.
 */
function fixAllTypos(args) {
    const edit = new vscode.WorkspaceEdit();
    const uri = args.document.uri;
    const hist = new history_1.CodespellHistory();
    diagnostics_1.getCodespellDiagnostics(args.document).forEach((diagnostic) => {
        if (!diagnostic.suggestions.length) {
            return;
        }
        edit.replace(uri, diagnostic.range, diagnostic.suggestions[0]);
        hist.write(`${diagnostic.token} -> ${diagnostic.suggestions[0]}\n`);
    });
    vscode.workspace.applyEdit(edit);
    hist.end();
}
/**
 * Fixes all the typos of the document common in PNU and DAUM services.
 *
 * Called by `vscode-codespell.fixCommonTypos` code action command.
 */
function fixCommonTypos(args) {
    const edit = new vscode.WorkspaceEdit();
    const uri = args.document.uri;
    const hist = new history_1.CodespellHistory();
    diagnostics_1.getCodespellDiagnostics(args.document).forEach((diagnostic) => {
        if (!diagnostic.suggestions.length || !diagnostic.typo.isCommon) {
            return;
        }
        edit.replace(uri, diagnostic.range, diagnostic.suggestions[0]);
        hist.write(`${diagnostic.token} -> ${diagnostic.suggestions[0]}\n`);
    });
    vscode.workspace.applyEdit(edit);
    hist.end();
}
//# sourceMappingURL=extension.js.map