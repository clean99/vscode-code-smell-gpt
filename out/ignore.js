"use strict";
/** Defines `CodesmellIgnore` class. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesmellIgnore = void 0;
const fs = require("fs");
const minimatch_1 = require("minimatch");
/**
 * `CodesmellIgnore` class having glob patterns to match typo tokens. If a token
 * is matched to a glob pattern, it's ignored.
 */
class CodesmellIgnore {
    constructor() {
        /** Checks if token matches content of `.Codesmell-ignore` */
        this.match = (token) => this.myMatches.match(token);
        /** Checks if valid content of `.Codesmell-ignore` is empty */
        this.empty = () => this.myMatches.empty;
        this.myMatches = CodesmellIgnore.get();
    }
    /** Checks if the last char of the content of `.Codesmell-ignore` is '\n'. */
    static needLN() {
        const matches = CodesmellIgnore.get();
        if (matches.empty ||
            matches.pattern.lastIndexOf(',}') === matches.pattern.length - 2) {
            return false;
        }
        return true;
    }
    /** Reads glob patterns in `.Codesmell-ignore`. */
    static get() {
        try {
            const stat = fs.statSync(CodesmellIgnore.path);
            if (stat === undefined) {
                CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
                return CodesmellIgnore.matches;
            }
            if (CodesmellIgnore.lastModified === stat.mtimeMs) {
                return CodesmellIgnore.matches;
            }
            CodesmellIgnore.lastModified = stat.mtimeMs;
            const ignores = `{${fs
                .readFileSync(CodesmellIgnore.path, 'utf8')
                .replace(/[,{}]/g, '\\$&')
                .replace(/\n\n*/g, ',')}}`;
            if (ignores.length >= 3) {
                CodesmellIgnore.matches = new minimatch_1.Minimatch(ignores);
            }
            else {
                CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
            }
        }
        catch (err) {
            // @ts-ignore
            console.log(err.message);
            CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
        }
        return CodesmellIgnore.matches;
    }
}
exports.CodesmellIgnore = CodesmellIgnore;
/** File path of `.Codesmell-ignore` */
CodesmellIgnore.path = `${process.env.HOME || process.env.USERPROFILE}/.Codesmell-ignore`;
/** Glob patterns in `.Codesmell-ignore`. */
CodesmellIgnore.emptyMatches = new minimatch_1.Minimatch('');
CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
/** Last modified time of `.Codesmell-ignore` */
CodesmellIgnore.lastModified = -1;
/** Adds a glob pattern to the end of file */
CodesmellIgnore.append = (pattern) => {
    fs.writeFileSync(CodesmellIgnore.path, CodesmellIgnore.needLN() ? `\n${pattern}\n` : `${pattern}\n`, { flag: 'a' });
};
//# sourceMappingURL=ignore.js.map