"use strict";
/** Defines `CodespellIgnore` class. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodespellIgnore = void 0;
const fs = require("fs");
const minimatch_1 = require("minimatch");
/**
 * `CodespellIgnore` class having glob patterns to match typo tokens. If a token
 * is matched to a glob pattern, it's ignored.
 */
class CodespellIgnore {
    constructor() {
        /** Checks if token matches content of `.codespell-ignore` */
        this.match = (token) => this.myMatches.match(token);
        /** Checks if valid content of `.codespell-ignore` is empty */
        this.empty = () => this.myMatches.empty;
        this.myMatches = CodespellIgnore.get();
    }
    /** Checks if the last char of the content of `.codespell-ignore` is '\n'. */
    static needLN() {
        const matches = CodespellIgnore.get();
        if (matches.empty ||
            matches.pattern.lastIndexOf(',}') === matches.pattern.length - 2) {
            return false;
        }
        return true;
    }
    /** Reads glob patterns in `.codespell-ignore`. */
    static get() {
        try {
            const stat = fs.statSync(CodespellIgnore.path);
            if (stat === undefined) {
                CodespellIgnore.matches = CodespellIgnore.emptyMatches;
                return CodespellIgnore.matches;
            }
            if (CodespellIgnore.lastModified === stat.mtimeMs) {
                return CodespellIgnore.matches;
            }
            CodespellIgnore.lastModified = stat.mtimeMs;
            const ignores = `{${fs
                .readFileSync(CodespellIgnore.path, 'utf8')
                .replace(/[,{}]/g, '\\$&')
                .replace(/\n\n*/g, ',')}}`;
            if (ignores.length >= 3) {
                CodespellIgnore.matches = new minimatch_1.Minimatch(ignores);
            }
            else {
                CodespellIgnore.matches = CodespellIgnore.emptyMatches;
            }
        }
        catch (err) {
            // @ts-ignore
            console.log(err.message);
            CodespellIgnore.matches = CodespellIgnore.emptyMatches;
        }
        return CodespellIgnore.matches;
    }
}
exports.CodespellIgnore = CodespellIgnore;
/** File path of `.codespell-ignore` */
CodespellIgnore.path = `${process.env.HOME || process.env.USERPROFILE}/.codespell-ignore`;
/** Glob patterns in `.codespell-ignore`. */
CodespellIgnore.emptyMatches = new minimatch_1.Minimatch('');
CodespellIgnore.matches = CodespellIgnore.emptyMatches;
/** Last modified time of `.codespell-ignore` */
CodespellIgnore.lastModified = -1;
/** Adds a glob pattern to the end of file */
CodespellIgnore.append = (pattern) => {
    fs.writeFileSync(CodespellIgnore.path, CodespellIgnore.needLN() ? `\n${pattern}\n` : `${pattern}\n`, { flag: 'a' });
};
//# sourceMappingURL=ignore.js.map