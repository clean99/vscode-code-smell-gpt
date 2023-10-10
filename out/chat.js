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
let openai;
const initChat = (apiKey) => {
    openai = new openai_1.default({
        apiKey,
    });
};
exports.initChat = initChat;
const prompt = (content) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
const getCodeBlock = (text) => { var _a, _b; return (_b = (_a = /```[\s\S]*?\n([\s\S]*?)\n```/.exec(text)) === null || _a === void 0 ? void 0 : _a[1].trim()) !== null && _b !== void 0 ? _b : null; };
exports.getCodeBlock = getCodeBlock;
const getTypos = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const DESC = `
        You are an expert at software engineering,
        you are responsible for reviewing my code and ensuring my code is following the best practices and maintainable, stable, and reusable.
        Please help me review the following code block, return a JSON array with the modifications for me to match and replace,
        You don't need to return other content except the JSON array, don't modify if it is not necessary, make the desc precise and content necessary info.
        and simply description for the chances as the following JSON format,
        Add \`\`\` at the start and end of json:
            [
                {
                    // The token of the place that need to change.
                    token: string;
                    // Suggestions for fixing&refactoring existing token. At least 1 suggestion at most 5 suggestions.
                    suggestions: string[];
                    // Description info.
                    info: string;
                }
            ]
        Here is my code:
    `;
    const promptResult = yield exports.prompt(`
        ${DESC}\n
        \`\`\`
        ${code}
        \`\`\`
    `);
    const codeBlock = exports.getCodeBlock(promptResult);
    if (codeBlock) {
        return JSON.parse(codeBlock);
    }
    // @ts-ignore
    return [];
});
exports.getTypos = getTypos;
//# sourceMappingURL=chat.js.map