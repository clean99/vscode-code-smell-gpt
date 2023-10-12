import OpenAI from "openai";
import { CodesmellTypo } from "./typo";

let openai: OpenAI;

export const initChat = (apiKey: string) => {
    openai = new OpenAI({
        apiKey,
    });
};

export const prompt = async (content: string) => {
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
 /```[\s\S]*?\n([\s\S]*?)\n```/.exec(text)?.[1].trim() ?? null;


export const getTypos = async (code: string): Promise<CodesmellTypo[]>  => {
    const DESC = `
        You are an expert at software engineering,
        review my code below and ensure highlighting potential bugs, improving readability, making code cleaner.
        The code snippets you receive may be **incomplete**, code from different places are consolidated and use placeholder '「」' to mark them.
        return a JSON array for me to match and replace,
        only return a JSON array as below, don't modify code unless it is necessary, keep info short and precise.
        Add \`\`\` at the start and end of json:
        [
            {
                // The code that need change. Don't change code here even spaces, as it be used to match the original text
                token: string;
                // Suggestion **code** for replacing existing code. If the suggestion is to delete, use empty string ''
                suggestion: string;
                // Short description about the changes
                info: string;
            }
        ]
        Code:
    `;
    const promptResult = await prompt(`
        ${DESC}\n
        \`\`\`
        ${code}
        \`\`\`
    `);
    const codeBlock = getCodeBlock(promptResult);
    if (codeBlock) {
    return JSON.parse(codeBlock);
    }

    // @ts-ignore
    return [];
};