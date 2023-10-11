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
const codeaction_1 = require("./codeaction");
const spellcheck_commands_1 = require("./spellcheck-commands");
const diagnostics_1 = require("./diagnostics");
const chat_1 = require("./chat");
const utils_1 = require("./utils");
exports.myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
/** Called once the extension is activated. */
function activate(context) {
    context.subscriptions.push(exports.myStatusBarItem);
    const userGPTKey = (0, utils_1.getUserKey)();
    (0, utils_1.setInitLoading)();
    exports.myStatusBarItem.show();
    if (userGPTKey) {
        (0, chat_1.initChat)(userGPTKey);
        (0, utils_1.setLoadedSuccess)();
    }
    else {
        (0, utils_1.setConfigError)();
        const checkAPIKey = vscode.workspace.onDidSaveTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
            const newUserGPTKey = (0, utils_1.getUserKey)();
            if (newUserGPTKey) {
                (0, chat_1.initChat)(newUserGPTKey);
                checkAPIKey.dispose();
                (0, utils_1.setLoadedSuccess)();
            }
        }));
        // Register disposable
        context.subscriptions.push(checkAPIKey);
        return;
    }
    // Subscribes `refreshDiagnostics` to documents change events.
    (0, diagnostics_1.subscribeDiagnosticsToDocumentChanges)(context);
    // Registers the code actions for `vscode-code-smell-gpt.fixTypo`,
    // `vscode-code-smell-gpt.fixAllTypos`, and `vscode-code-smell-gpt.fixCommonTypos`.
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('*', new codeaction_1.CodesmellCodeAction(), { providedCodeActionKinds: codeaction_1.CodesmellCodeAction.providedCodeActionKinds }));
    // Binds code action commands to corresponding functions.
    context.subscriptions.push(vscode.commands.registerCommand('vscode-code-smell-gpt.fixTypo', fixTypo));
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
    vscode.workspace.applyEdit(edit);
}
//# sourceMappingURL=extension.js.map