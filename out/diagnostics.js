"use strict";
/**
 * Defines diagnostic data structure containing a typo for a range of a
 * document.
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
exports.subscribeDiagnosticsToDocumentChanges = exports.CodesmellDiagnostic = exports.refreshDiagnostics = exports.escapeRegExp = exports.getCodesmellDiagnostics = exports.CODE_SMELL_MENTION = void 0;
const vscode = require("vscode");
const spellcheck_1 = require("./spellcheck");
const utils_1 = require("./utils");
const _ = require("lodash");
/**
 * Used to associate diagnostic entries with code actions.
 */
exports.CODE_SMELL_MENTION = 'Codesmell';
/** Dictionary of `vscode.TextDocument` to `CodesmellDiagnostic[]`. */
const CodesmellDiagnostics = vscode.languages.createDiagnosticCollection('Codesmell');
/** Returns the diagnostics for the given document. */
function getCodesmellDiagnostics(doc) {
    return CodesmellDiagnostics.get(doc.uri);
}
exports.getCodesmellDiagnostics = getCodesmellDiagnostics;
function escapeRegExp(text) {
    var _a;
    return (_a = text === null || text === void 0 ? void 0 : text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')) !== null && _a !== void 0 ? _a : '';
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
            diagnostics.push(new CodesmellDiagnostic(range, typo));
        }
    });
    CodesmellDiagnostics.set(doc.uri, diagnostics);
}
exports.refreshDiagnostics = refreshDiagnostics;
/** Diagnostic data structure containing a typo for a range of a document. */
class CodesmellDiagnostic extends vscode.Diagnostic {
    constructor(range, typo) {
        var _a;
        super(range, (_a = typo.info) !== null && _a !== void 0 ? _a : '', typo.severity !== undefined
            ? typo.severity
            : typo.isCommon !== false
                ? vscode.DiagnosticSeverity.Warning
                : vscode.DiagnosticSeverity.Information);
        this.typo = typo;
        this.code = exports.CODE_SMELL_MENTION;
        this.token = typo.token;
        this.suggestions = [typo.suggestion];
    }
}
exports.CodesmellDiagnostic = CodesmellDiagnostic;
/** Subscribes `refreshDiagnostics` to documents change events. */
function subscribeDiagnosticsToDocumentChanges(context) {
    context.subscriptions.push(CodesmellDiagnostics);
    // A Map to store the last saved content of documents.
    let lastSavedContent = new Map();
    // Listen for save events
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document);
        // Retrieve the document's URI as a string to use as a key
        let documentUri = vscode.window.activeTextEditor.document.uri.toString();
        // init content to be empty, so that when user first click save, it will reflect all changes.
        let currentContent = '';
        lastSavedContent.set(documentUri, currentContent);
    }
    let saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => __awaiter(this, void 0, void 0, function* () {
        // Retrieve the document's URI as a string to use as a key
        let documentUri = document.uri.toString();
        // Get the content at the time of save
        let currentContent = document.getText();
        // Retrieve the last saved content from the map
        let previousContent = lastSavedContent.get(documentUri) || "";
        // Get differences between the previous content and current content
        let differences = (0, utils_1.findDifferences)(previousContent, currentContent);
        if (!_.isEmpty(differences)) {
            yield (0, spellcheck_1.spellCheck)(document, differences);
            refreshDiagnostics(document);
        }
        // Update the last saved content in the map
        lastSavedContent.set(documentUri, currentContent);
    }));
    let docChangeListener = vscode.workspace.onDidChangeTextDocument(() => {
        var _a;
        if ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document) {
            refreshDiagnostics(vscode.window.activeTextEditor.document);
        }
    });
    // Register disposable
    context.subscriptions.push(saveDisposable, docChangeListener);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            refreshDiagnostics(editor.document);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((doc) => CodesmellDiagnostics.delete(doc.uri)));
}
exports.subscribeDiagnosticsToDocumentChanges = subscribeDiagnosticsToDocumentChanges;
//# sourceMappingURL=diagnostics.js.map