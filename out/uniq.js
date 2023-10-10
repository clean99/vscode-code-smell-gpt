"use strict";
/** Defines `uniq()` function. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uniq = void 0;
const service_1 = require("./service");
/** Checks if two typos are from different services. */
function areFromDifferentServices(a, b) {
    // Only DAUM service has `HanspellTypo.type`.
    return ((a.type !== undefined && b.type === undefined) ||
        (a.type === undefined && b.type !== undefined) ||
        a.isLocal === true ||
        b.isLocal === true);
}
/** Checks if `a.token` is longer than `b.token`. */
const longerThan = (a, b) => a.token.length > b.token.length;
/**
 * Removes same or nearly same tokens from the typos array, and sets
 * `HanspellTypo.isCommon` and `HanspellTypo.regex`.
 */
function uniq(typos, service) {
    if (typos.length === 0) {
        return typos;
    }
    // Checks if there are multiple instances of a typo. We don't need them.
    //
    // e.g., if `sorted.map((t) => t.token)` is ['a', 'a', 'xyz', '  a.'],
    // then `isUniq` is [true, false, true, false].
    const isUniq = Array(typos.length).fill(true);
    // Sorts typos by length.
    const sorted = typos.sort((a, b) => longerThan(b, a) ? -1 : longerThan(a, b) ? 1 : 0);
    // Sets `typo.isCommon` and `isUniq[i]` for each element of sorted array.
    sorted.forEach((shortTypo, i) => {
        if (!isUniq[i]) {
            return;
        }
        // Escapes regular expression special characters, and allocates `RegExp` to
        // match word boundary later in `refreshDiagnostics()` or somewhere.
        const escaped = shortTypo.token.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        if (shortTypo.regex === undefined) {
            shortTypo.regex = new RegExp(`(^|(?<=[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]))${escaped}((?=[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z])|$)`, 'g');
        }
        if (service === service_1.SpellCheckService.all) {
            if (shortTypo.isLocal === true) {
                shortTypo.isCommon = true;
            }
            else {
                shortTypo.isCommon = false;
            }
        }
        else {
            shortTypo.isCommon = undefined;
        }
        // Checks if a long token (sorted[j].token) has no additional letters.
        const nearlySameToShortToken = new RegExp(`^[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]*${escaped}[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]*$`);
        // Removes same or nearly same tokens.
        for (let j = i + 1; j < typos.length; j++) {
            if (isUniq[j] && sorted[j].token.match(nearlySameToShortToken)) {
                isUniq[j] = false;
                if (service === service_1.SpellCheckService.all &&
                    areFromDifferentServices(shortTypo, sorted[j])) {
                    shortTypo.isCommon = true;
                }
            }
        }
    });
    // Filters duplicated elements.
    return sorted.filter((_, i) => isUniq[i]);
}
exports.uniq = uniq;
//# sourceMappingURL=uniq.js.map