"use strict";
/** Defines `CodespellHistory` class. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodespellHistory = void 0;
const fs = require("fs");
/** `CodespellHistory` class providing log writing. */
class CodespellHistory {
    constructor() {
        this.stream = fs.createWriteStream(CodespellHistory.path, {
            flags: 'a',
        });
    }
    write(log) {
        return this.stream.write(log);
    }
    end() {
        this.stream.end();
    }
    static writeOnce(log) {
        fs.writeFile(CodespellHistory.path, log, { flag: 'a' }, (_) => { });
    }
    /**
     * Stats history file size, and renames it to a backup file when it is too
     * large.
     */
    static backupIfTooLarge() {
        try {
            const stat = fs.statSync(CodespellHistory.path);
            if (stat === undefined) {
                return;
            }
            if (stat.size > 10 * 1024 * 1024) {
                for (let i = 1; i < 10000; ++i) {
                    const newPath = `${CodespellHistory.path}.${i}`;
                    if (!fs.existsSync(newPath)) {
                        fs.rename(CodespellHistory.path, newPath, (_) => { });
                        return;
                    }
                }
            }
        }
        catch (err) { }
    }
}
exports.CodespellHistory = CodespellHistory;
/** File path of `.codespell-history` */
CodespellHistory.path = `${process.env.HOME || process.env.USERPROFILE}/.codespell-history`;
//# sourceMappingURL=history.js.map