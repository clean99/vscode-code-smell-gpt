"use strict";
/** Defines `CodespellBadExpressions` class for offline typo fixing. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodespellBadExpressions = void 0;
const vscode = require("vscode");
const fs = require("fs");
function toDiagnosticSeverity(severity) {
    if (severity === undefined) {
        return vscode.DiagnosticSeverity.Information;
    }
    switch (severity.toLowerCase()) {
        case 'information':
            return vscode.DiagnosticSeverity.Information;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'hint':
            return vscode.DiagnosticSeverity.Hint;
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}
/** Carries user defined typos from `~/.codespell-bad-expressions.json`. */
class CodespellBadExpressions {
    /** Reads typos in `.codespell-bad-expressions.json`. */
    static getTypos() {
        try {
            const stat = fs.statSync(CodespellBadExpressions.path);
            if (stat === undefined) {
                CodespellBadExpressions.typos = [];
                return CodespellBadExpressions.typos;
            }
            if (CodespellBadExpressions.lastModified === stat.mtimeMs) {
                return CodespellBadExpressions.typos;
            }
            CodespellBadExpressions.lastModified = stat.mtimeMs;
            CodespellBadExpressions.typos = JSON.parse(fs.readFileSync(CodespellBadExpressions.path, 'utf8'))['bad-expressions'].map((bad) => {
                if (bad.expression === undefined) {
                    throw new Error('No "expression" in JSON');
                }
                return {
                    token: '',
                    suggestions: bad.suggestions ? bad.suggestions : [],
                    severity: toDiagnosticSeverity(bad.severity),
                    regex: new RegExp(bad.expression, 'g'),
                    info: bad.info ? bad.info : '사용자 정의 표현식',
                };
            });
        }
        catch (err) {
            // If JSON error.
            if (err.message.indexOf('ENOENT') !== 0) {
                vscode.window.showInformationMessage(`~/.codespell-bad-expressions.json 오류: ${err.message}`);
            }
            CodespellBadExpressions.typos = [];
        }
        return CodespellBadExpressions.typos;
    }
}
exports.CodespellBadExpressions = CodespellBadExpressions;
/** File path of `.codespell-bad-expressions.json` */
CodespellBadExpressions.path = `${process.env.HOME || process.env.USERPROFILE}/.codespell-bad-expressions.json`;
/** CodespellTypo array in `.codespell-bad-expressions.json`. */
CodespellBadExpressions.typos = [];
/** Last modified time of `.codespell-bad-expressions.json` */
CodespellBadExpressions.lastModified = -1;
//# sourceMappingURL=bad-expressions.js.map