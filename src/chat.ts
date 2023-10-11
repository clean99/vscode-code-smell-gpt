import OpenAI from "openai";
import { CodespellTypo } from "./typo";

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


export const getTypos = async (code: string): Promise<CodespellTypo[]>  => {
    const DESC = `
        You are an expert at software engineering,
        review my code below and ensure it is following the best practices, and more maintainable.
        code before Placeholder「」and after are separated code block.
        return a JSON array for me to match and replace,
        only return a JSON array as below, don't modify code unless it is necessary, keep info short and precise.
        Add \`\`\` at the start and end of json:
            [
                {
                    // The code that need change. Don't change code here even spaces, as this value will be used to match the original text
                    token: string;
                    // Suggestions **code** for replacing existing code. At least 1 and most 3 suggestions. If the suggestion is to delete, use empty string ''
                    suggestions: string[];
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

    console.log('promptResult', promptResult);

    const codeBlock = getCodeBlock(promptResult);

    console.log('promptResult1', codeBlock);

    if (codeBlock) {
    return JSON.parse(codeBlock);
    }

    // @ts-ignore
    return [];
};