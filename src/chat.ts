import OpenAI from "openai";
import { CodesmellTypo } from "./typo";
import { setConfigError } from "./utils";

let openai: OpenAI;

export const initChat = (apiKey: string) => {
    openai = new OpenAI({
        apiKey,
    });
};

export const prompt = async (content: string) => {
    if(!openai) return;
    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content }],
        model: "gpt-4",
    });

    return chatCompletion.choices[0].message.content ?? '';
};

/**
* A function that takes a string input and returns the normalized string.
* @param text
* @returns {string}
*/
export const getCodeBlock = (text: string): string | null =>
 /```[\s\S]*?\n([\s\S]*?)\n```/.exec(text)?.[1].trim() ?? text;


export const getTypos = async (code: string): Promise<CodesmellTypo[]>  => {
    const DESC = `
    You are an expert at software engineering,
    review my code below and highlight potential bugs, readability, code cleaning issues.
    The code snippets you receive may be **incomplete**, code from different places are consolidated and use placeholder '~' as a mark. Don't make assumption for unknown code(Eg. assume that never use).
    Consolidate code change if they are continuous,
    **only** return a JSON array as below, don't modify code unless it is necessary, keep changes and info short and precise.:
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
        const promptResult = await prompt(`
        ${DESC}\n
        \`\`\`
        ${code}
        \`\`\`
        `);
        const codeBlock = getCodeBlock(promptResult ?? '');

        if (codeBlock) {
        return JSON.parse(codeBlock);
        }
        return [];
    } catch(e: any) {
        setConfigError(e?.message);
        return [];
    }
};