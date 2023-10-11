"use strict";
/** Defines the functions for spellcheck-related commands. */
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
exports.spellCheckByAll = void 0;
const vscode = require("vscode");
const diagnostics_1 = require("./diagnostics");
const spellcheck_1 = require("./spellcheck");
const spellCheckByAll = () => spellCheckWithProgress('code spelling');
exports.spellCheckByAll = spellCheckByAll;
/** Calls `spellCheck()` with progress bar, and `refreshDiagnostics()`. */
function spellCheckWithProgress(title) {
    const editor = vscode.window.activeTextEditor;
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: editor ? title : 'There is no document to check the spelling/grammar.',
        cancellable: true,
    }, () => __awaiter(this, void 0, void 0, function* () {
        if (editor) {
            try {
                yield spellcheck_1.spellCheck(editor.document);
            }
            catch (err) {
                vscode.window.showInformationMessage(err);
            }
            diagnostics_1.refreshDiagnostics(editor.document);
        }
    }));
}
//# sourceMappingURL=spellcheck-commands.js.map