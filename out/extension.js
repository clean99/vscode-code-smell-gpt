"use strict";
/**
 * Defines the functions for the code action commands, and registers all the
 * commands and `refreshDiagnostics`.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.myStatusBarItem = void 0;
const vscode = require("vscode");
const spellcheck_1 = require("./spellcheck");
const ignore_1 = require("./ignore");
const history_1 = require("./history");
const codeaction_1 = require("./codeaction");
const spellcheck_commands_1 = require("./spellcheck-commands");
const diagnostics_1 = require("./diagnostics");
const chat_1 = require("./chat");
const utils_1 = require("./utils");
exports.myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
/** Called once the extension is activated. */
function activate(context) {
    context.subscriptions.push(exports.myStatusBarItem);
    const userGPTKey = utils_1.getUserKey();
    utils_1.setInitLoading();
    exports.myStatusBarItem.show();
    history_1.CodesmellHistory.backupIfTooLarge();
    if (userGPTKey) {
        chat_1.initChat(userGPTKey);
        utils_1.setLoadedSuccess();
    }
    else {
        utils_1.setConfigError();
        const checkAPIKey = vscode.workspace.onDidSaveTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
            const newUserGPTKey = utils_1.getUserKey();
            if (newUserGPTKey) {
                chat_1.initChat(newUserGPTKey);
                checkAPIKey.dispose();
                utils_1.setLoadedSuccess();
            }
        }));
        // Register disposable
        context.subscriptions.push(checkAPIKey);
        return;
    }
    // Subscribes `refreshDiagnostics` to documents change events.
    diagnostics_1.subscribeDiagnosticsToDocumentChanges(context);
    // Registers the code actions for `vscode-code-smell-gpt.fixTypo`,
    // `vscode-code-smell-gpt.fixAllTypos`, and `vscode-code-smell-gpt.fixCommonTypos`.
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('*', new codeaction_1.CodesmellCodeAction(), { providedCodeActionKinds: codeaction_1.CodesmellCodeAction.providedCodeActionKinds }));
    // Binds code action commands to corresponding functions.
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.fixTypo', fixTypo));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.ignoreTypo', ignoreTypo));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.fixAllTypos', fixAllTypos));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.fixCommonTypos', fixCommonTypos));
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.spellCheckByAll', spellcheck_commands_1.spellCheckByAll));
}
exports.activate = activate;
/**
 * Fixes the typo of the given range of the document.
 *
 * Called by `vscode-code-smell-gpt.fixTypo` code action command.
 */
function fixTypo(args) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(args.document.uri, args.range, args.suggestion);
    history_1.CodesmellHistory.writeOnce(`${args.token} -> ${args.suggestion}\n`);
    vscode.workspace.applyEdit(edit);
}
/**
 * Adds given token to `~/.Codesmell-ignore`).
 *
 * Called by `vscode-code-smell-gpt.ignoreTypo` code action command.
 */
function ignoreTypo(args) {
    ignore_1.CodesmellIgnore.append(args.token);
    const typos = spellcheck_1.DocumentsToTypos.getTypos(args.document);
    spellcheck_1.DocumentsToTypos.setTypos(args.document, typos.filter((typo) => typo.token !== args.token));
    diagnostics_1.refreshDiagnostics(args.document);
}
/**
 * Fixes all the typos of the document.
 *
 * Called by `vscode-code-smell-gpt.fixAllTypos` code action command.
 */
function fixAllTypos(args) {
    const edit = new vscode.WorkspaceEdit();
    const uri = args.document.uri;
    const hist = new history_1.CodesmellHistory();
    diagnostics_1.getCodesmellDiagnostics(args.document).forEach((diagnostic) => {
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
 * Called by `vscode-code-smell-gpt.fixCommonTypos` code action command.
 */
function fixCommonTypos(args) {
    const edit = new vscode.WorkspaceEdit();
    const uri = args.document.uri;
    const hist = new history_1.CodesmellHistory();
    diagnostics_1.getCodesmellDiagnostics(args.document).forEach((diagnostic) => {
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