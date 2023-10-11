"use strict";
/** Defines `DocumentsToTypos` class and `spellCheck()` function. */
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
exports.spellCheck = exports.DocumentsToTypos = void 0;
const chat_1 = require("./chat");
/** Class for dictionary of `vscode.TextDocument` to `CodespellTypo[]`. */
class DocumentsToTypos {
}
exports.DocumentsToTypos = DocumentsToTypos;
/** Dictionary of `vscode.TextDocument` to `CodespellTypo[]`. */
DocumentsToTypos.docs2typos = new WeakMap();
/** Gets typos of the document. */
DocumentsToTypos.getTypos = (doc) => DocumentsToTypos.docs2typos.get(doc);
/** Sets typos of the document. */
DocumentsToTypos.setTypos = (doc, typos) => DocumentsToTypos.docs2typos.set(doc, typos);
/**
 * Spell checks given document, makes `CodespellTypo[]`, and sets them to
 * `DocumentsToTypos`.
 */
function spellCheck(document, differences) {
    return __awaiter(this, void 0, void 0, function* () {
        const doc = document;
        const text = differences ? differences.join('「」') : doc.getText();
        const typos = yield chat_1.getTypos(text);
        DocumentsToTypos.setTypos(doc, typos);
    });
}
exports.spellCheck = spellCheck;
//# sourceMappingURL=spellcheck.js.map