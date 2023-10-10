"use strict";
/**
 * Defines diagnostic data structure containing a typo for a range of a
 * document.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeDiagnosticsToDocumentChanges = exports.CodespellDiagnostic = exports.refreshDiagnostics = exports.escapeRegExp = exports.getCodespellDiagnostics = exports.CODE_SPELL_MENTION = void 0;
const vscode = require("vscode");
const spellcheck_1 = require("./spellcheck");
/**
 * Used to associate diagnostic entries with code actions.
 */
exports.CODE_SPELL_MENTION = 'codespell';
/** Dictionary of `vscode.TextDocument` to `codespellDiagnostic[]`. */
const codespellDiagnostics = vscode.languages.createDiagnosticCollection('codespell');
/** Returns the diagnostics for the given document. */
function getCodespellDiagnostics(doc) {
    return codespellDiagnostics.get(doc.uri);
}
exports.getCodespellDiagnostics = getCodespellDiagnostics;
function escapeRegExp(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
exports.escapeRegExp = escapeRegExp;
/**
 * Makes the diagnostics out of typos of document.
 *
 * Automatically called when the document is edited.
 */
function refreshDiagnostics(doc) {
    const typos = spellcheck_1.DocumentsToTypos.getTypos(doc);
    const docText = doc.getText();
    if (!typos) {
        return;
    }
    const diagnostics = [];
    typos.forEach((typo) => {
        let match;
        // Assume token is not a regular expression special character. If it is, need to escape it.
        // The 'm' flag enables multi-line matching
        const regex = new RegExp(escapeRegExp(typo.token), 'gm');
        while ((match = regex.exec(docText)) !== null) {
            // Get line and character for start position
            const startPos = doc.positionAt(match.index);
            // Get line and character for end position
            const endPos = doc.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            diagnostics.push(new CodespellDiagnostic(range, typo, match));
        }
    });
    codespellDiagnostics.set(doc.uri, diagnostics);
}
exports.refreshDiagnostics = refreshDiagnostics;
/** Diagnostic data structure containing a typo for a range of a document. */
class CodespellDiagnostic extends vscode.Diagnostic {
    constructor(range, typo, matched) {
        super(range, typo.info, typo.severity !== undefined
            ? typo.severity
            : typo.isCommon !== false
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Information);
        this.typo = typo;
        this.code = exports.CODE_SPELL_MENTION;
        this.token = typo.token;
        this.suggestions = typo.suggestions;
    }
}
exports.CodespellDiagnostic = CodespellDiagnostic;
/** Subscribes `refreshDiagnostics` to documents change events. */
function subscribeDiagnosticsToDocumentChanges(context) {
    context.subscriptions.push(codespellDiagnostics);
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document);
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            refreshDiagnostics(editor.document);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((editor) => refreshDiagnostics(editor.document)));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((doc) => codespellDiagnostics.delete(doc.uri)));
}
exports.subscribeDiagnosticsToDocumentChanges = subscribeDiagnosticsToDocumentChanges;
//# sourceMappingURL=diagnostics.js.map