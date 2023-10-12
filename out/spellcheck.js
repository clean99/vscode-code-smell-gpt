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
const utils_1 = require("./utils");
/** Class for dictionary of `vscode.TextDocument` to `CodesmellTypo[]`. */
class DocumentsToTypos {
}
exports.DocumentsToTypos = DocumentsToTypos;
/** Dictionary of `vscode.TextDocument` to `CodesmellTypo[]`. */
DocumentsToTypos.docs2typos = new WeakMap();
/** Gets typos of the document. */
DocumentsToTypos.getTypos = (doc) => DocumentsToTypos.docs2typos.get(doc);
/** Sets typos of the document. */
DocumentsToTypos.setTypos = (doc, typos) => DocumentsToTypos.docs2typos.set(doc, typos);
/**
 * Spell checks given document, makes `CodesmellTypo[]`, and sets them to
 * `DocumentsToTypos`.
 */
function spellCheck(document, differences) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        (0, utils_1.setSpinning)();
        try {
            const doc = document;
            const text = differences ? differences.join('~') : doc.getText();
            const typos = yield (0, chat_1.getTypos)(text);
            const previousTypos = (_a = DocumentsToTypos.getTypos(doc)) !== null && _a !== void 0 ? _a : [];
            DocumentsToTypos.setTypos(doc, [...previousTypos, ...typos]);
        }
        catch (e) {
            console.log('error', e);
        }
        finally {
            (0, utils_1.setLoadedSuccess)();
        }
    });
}
exports.spellCheck = spellCheck;
//# sourceMappingURL=spellcheck.js.map