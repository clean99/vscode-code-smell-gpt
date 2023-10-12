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
    // Return the formatted diff
    return addedLines;
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

export function setConfigError() {
    myStatusBarItem.text = "$(error) Code Smell GPT";  // Using a built-in icon
    myStatusBarItem.tooltip = "Code Smell GPT: Please config your gpt key first! XD \nFollow Instruction: https://github.com/clean99/vscode-code-smell-gpt/blob/main/README.md";
    vscode.window.showInformationMessage(
      `Code Smell GPT: Please config your gpt key first! XD \nFollow Instruction: https://github.com/clean99/vscode-code-smell-gpt/blob/main/README.md`,
    );
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
        setLoadedSuccess();
    }
}