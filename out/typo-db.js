"use strict";
/** Defines `HanspellTypoDB` class for offline typo fixing. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HanspellTypoDB = void 0;
const fs = require("fs");
/** Carries user defined typos from `~/.hanspell-typos`. */
class HanspellTypoDB {
    /** Reads typos in `.hanspell-typos`. */
    static getTypos() {
        try {
            const stat = fs.statSync(HanspellTypoDB.path);
            if (stat === undefined) {
                HanspellTypoDB.typos = [];
                return HanspellTypoDB.typos;
            }
            if (HanspellTypoDB.lastModified === stat.mtimeMs) {
                return HanspellTypoDB.typos;
            }
            HanspellTypoDB.lastModified = stat.mtimeMs;
            HanspellTypoDB.typos = fs
                .readFileSync(HanspellTypoDB.path, 'utf8')
                .split('\n')
                .map((line) => line.split(' -> '))
                .filter((lr) => lr.length == 2 && lr[0] && lr[1])
                .map((lr) => {
                return {
                    token: lr[0],
                    suggestions: [lr[1]],
                    info: '사용자 맞춤법 정의',
                    isLocal: true,
                };
            });
        }
        catch (err) {
            console.log(err.message);
            HanspellTypoDB.typos = [];
        }
        return HanspellTypoDB.typos;
    }
}
exports.HanspellTypoDB = HanspellTypoDB;
/** File path of `.hanspell-typos` */
HanspellTypoDB.path = `${process.env.HOME || process.env.USERPROFILE}/.hanspell-typos`;
/** HanspellTypo array in `.hanspell-typos`. */
HanspellTypoDB.typos = [];
/** Last modified time of `.hanspell-typos` */
HanspellTypoDB.lastModified = -1;
//# sourceMappingURL=typo-db.js.map