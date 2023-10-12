import * as Diff from 'diff';
import * as _ from 'lodash';
import * as vscode from 'vscode';
import { myStatusBarItem } from './extension';
import { initChat } from './chat';

export function extractAddedLines(diff: string): string[] {
    // Split the diff into lines and filter for added code
    return diff
        .split('\n')
        .filter(line => line.startsWith('+'))
        .map(line => line.slice(1,))
        .join('\n')
        .split('++ code')
        .filter(item => !_.isEmpty(item));
}

export function findDifferences(code1: string, code2: string): string[] {
    // Generate the diff
    const diff = Diff.createPatch('code', code1, code2);
    const addedLines = extractAddedLines(diff);
    const lines = addedLines.join(' ');
    if(reachToken(lines)) {
        // Return the formatted diff
        return addedLines;
    }
    // Don't do anything if it doesn't reach threshold
    return [];
}

export function setSpinning() {
    const originText = myStatusBarItem.text;
    myStatusBarItem.text = '$(loading~spin) Reviewing';
    myStatusBarItem.tooltip = "I'm reviewing your code, please wait...";
}

export function setInitLoading() {
    const originText = myStatusBarItem.text;
    myStatusBarItem.text = '$(loading~spin) Loading';
    myStatusBarItem.tooltip = "I'm loading, please wait...";
}

export function setConfigError(message?: string) {
    const UNKNOWN_ERROR = 'Unknown error, please raise an issue in github: https://github.com/clean99/vscode-code-smell-gpt/issues';
    myStatusBarItem.text = "$(error) Code Smell GPT";  // Using a built-in icon
    myStatusBarItem.tooltip = message ?? UNKNOWN_ERROR;
    vscode.window.showErrorMessage(message ?? UNKNOWN_ERROR);
}

export function isConfigError(): boolean {
    return myStatusBarItem.text === "$(error) Code Smell GPT";
}

export function setLoadedSuccess() {
    myStatusBarItem.text = "$(smiley) Code Smell GPT";  // Using a built-in icon
    myStatusBarItem.tooltip = "I'm ready. Happy coding with Code Smell GPT! :)";
}

export function getUserKey() {
    return vscode.workspace.getConfiguration('vscode-code-smell-gpt').get<string>('gptKey');
}

export function registerUserKey() {
    const newUserGPTKey = getUserKey();
    if(newUserGPTKey) {
        initChat(newUserGPTKey);
        if(isConfigError()) {
            setLoadedSuccess();
        }
    }
}

export function reachToken(code: string, token: number = 20): boolean {
    return code.split('\n').reduce((res: string[], str) => ([...res, ...str.split(' ')]), []).filter(str => !_.isEmpty(str)).length > token;
}
