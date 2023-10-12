"use strict";
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
exports.getTypos = exports.getCodeBlock = exports.prompt = exports.initChat = void 0;
const openai_1 = require("openai");
const utils_1 = require("./utils");
let openai;
const initChat = (apiKey) => {
    openai = new openai_1.default({
        apiKey,
    });
};
exports.initChat = initChat;
const prompt = (content) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!openai)
        return;
    const chatCompletion = yield openai.chat.completions.create({
        messages: [{ role: "user", content }],
        model: "gpt-4",
    });
    return (_a = chatCompletion.choices[0].message.content) !== null && _a !== void 0 ? _a : '';
});
exports.prompt = prompt;
/**
* A function that takes a string input and returns the normalized string.
* @param text
* @returns {string}
*/
const getCodeBlock = (text) => { var _a, _b; return (_b = (_a = /```[\s\S]*?\n([\s\S]*?)\n```/.exec(text)) === null || _a === void 0 ? void 0 : _a[1].trim()) !== null && _b !== void 0 ? _b : text; };
exports.getCodeBlock = getCodeBlock;
const getTypos = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const DESC = `
    You are an expert at software engineering,
    review my code below and highlight potential bugs, readability, code cleaning issues.
    The code snippets you receive may be **incomplete**, code from different places are consolidated and use placeholder '~' as a mark. Don't make assumption for unknown code(Eg. assume that never use).
    **only** return a JSON array as below, don't modify code unless it is necessary, keep changes and info short and precise. Add \`\`\` at the start and end of json:
    [
        {
            // The code that need be changed. Don't modify any code here even just spaces, as it is used to match the original text
            token: string;
            // Suggested **code** for replacing existing code. Use empty string '' to represent delete original code.
            suggestion: string;
            // Short description about the change
            info: string;
        }
    ]
    Code:
    `;
    try {
        const promptResult = yield (0, exports.prompt)(`
        ${DESC}\n
        \`\`\`
        ${code}
        \`\`\`
        `);
        const codeBlock = (0, exports.getCodeBlock)(promptResult);
        if (codeBlock) {
            return JSON.parse(codeBlock);
        }
        return [];
    }
    catch (e) {
        (0, utils_1.setConfigError)(e === null || e === void 0 ? void 0 : e.message);
        return [];
    }
});
exports.getTypos = getTypos;
//# sourceMappingURL=chat.js.map