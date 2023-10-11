"use strict";
/** Defines `CodesmellHistory` class. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodesmellHistory = void 0;
const fs = require("fs");
/** `CodesmellHistory` class providing log writing. */
class CodesmellHistory {
    constructor() {
        this.stream = fs.createWriteStream(CodesmellHistory.path, {
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
        fs.writeFile(CodesmellHistory.path, log, { flag: 'a' }, (_) => { });
    }
    /**
     * Stats history file size, and renames it to a backup file when it is too
     * large.
     */
    static backupIfTooLarge() {
        try {
            const stat = fs.statSync(CodesmellHistory.path);
            if (stat === undefined) {
                return;
            }
            if (stat.size > 10 * 1024 * 1024) {
                for (let i = 1; i < 10000; ++i) {
                    const newPath = `${CodesmellHistory.path}.${i}`;
                    if (!fs.existsSync(newPath)) {
                        fs.rename(CodesmellHistory.path, newPath, (_) => { });
                        return;
                    }
                }
            }
        }
        catch (err) { }
    }
}
exports.CodesmellHistory = CodesmellHistory;
/** File path of `.Codesmell-history` */
CodesmellHistory.path = `${process.env.HOME || process.env.USERPROFILE}/.Codesmell-history`;
//# sourceMappingURL=history.js.map