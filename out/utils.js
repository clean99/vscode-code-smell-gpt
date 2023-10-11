"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserKey = exports.setLoadedSuccess = exports.setConfigError = exports.setInitLoading = exports.setSpinning = exports.findDifferences = exports.extractAddedLines = void 0;
const Diff = require("diff");
const _ = require("lodash");
const vscode = require("vscode");
const extension_1 = require("./extension");
function extractAddedLines(diff) {
    // Split the diff into lines and filter for added code
    return diff
        .split('\n')
        .filter(line => line.startsWith('+'))
        .map(line => line.slice(1))
        .join('\n')
        .split('++ code')
        .filter(item => !_.isEmpty(item));
}
exports.extractAddedLines = extractAddedLines;
function findDifferences(code1, code2) {
    // Generate the diff
    const diff = Diff.createPatch('code', code1, code2);
    const addedLines = extractAddedLines(diff);
    // Return the formatted diff
    return addedLines;
}
exports.findDifferences = findDifferences;
function setSpinning() {
    const originText = extension_1.myStatusBarItem.text;
    extension_1.myStatusBarItem.text = '$(loading~spin) Reviewing';
    extension_1.myStatusBarItem.tooltip = "I'm reviewing your code, please wait...";
}
exports.setSpinning = setSpinning;
function setInitLoading() {
    const originText = extension_1.myStatusBarItem.text;
    extension_1.myStatusBarItem.text = '$(loading~spin) Loading';
    extension_1.myStatusBarItem.tooltip = "I'm loading, please wait...";
}
exports.setInitLoading = setInitLoading;
function setConfigError() {
    extension_1.myStatusBarItem.text = "$(error) Code Smell GPT"; // Using a built-in icon
    extension_1.myStatusBarItem.tooltip = "Code Smell GPT: Please config your gpt key first! XD \nFollow Instruction: https://github.com/clean99/vscode-code-smell-gpt/blob/main/README.md";
    vscode.window.showInformationMessage(`Code Smell GPT: Please config your gpt key first! XD \nFollow Instruction: https://github.com/clean99/vscode-code-smell-gpt/blob/main/README.md`);
}
exports.setConfigError = setConfigError;
function setLoadedSuccess() {
    extension_1.myStatusBarItem.text = "$(smiley) Code Smell GPT"; // Using a built-in icon
    extension_1.myStatusBarItem.tooltip = "I'm ready. Happy coding with Code Smell GPT! :)";
}
exports.setLoadedSuccess = setLoadedSuccess;
function getUserKey() {
    return vscode.workspace.getConfiguration('vscode-code-smell-gpt').get('gptKey');
}
exports.getUserKey = getUserKey;
//# sourceMappingURL=utils.js.map