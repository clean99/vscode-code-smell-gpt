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