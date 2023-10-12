"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reachToken = exports.registerUserKey = exports.getUserKey = exports.setLoadedSuccess = exports.isConfigError = exports.setConfigError = exports.setInitLoading = exports.setSpinning = exports.findDifferences = exports.extractAddedLines = void 0;
const Diff = require("diff");
const _ = require("lodash");
const vscode = require("vscode");
const extension_1 = require("./extension");
const chat_1 = require("./chat");
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
    const lines = addedLines.join(' ');
    if (reachToken(lines)) {
        // Return the formatted diff
        return addedLines;
    }
    // Don't do anything if it doesn't reach threshold
    return [];
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
function setConfigError(message) {
    const UNKNOWN_ERROR = 'Unknown error, please raise an issue in github: https://github.com/clean99/vscode-code-smell-gpt/issues';
    extension_1.myStatusBarItem.text = "$(error) Code Smell GPT"; // Using a built-in icon
    extension_1.myStatusBarItem.tooltip = message !== null && message !== void 0 ? message : UNKNOWN_ERROR;
    vscode.window.showErrorMessage(message !== null && message !== void 0 ? message : UNKNOWN_ERROR);
}
exports.setConfigError = setConfigError;
function isConfigError() {
    return extension_1.myStatusBarItem.text === "$(error) Code Smell GPT";
}
exports.isConfigError = isConfigError;
function setLoadedSuccess() {
    extension_1.myStatusBarItem.text = "$(smiley) Code Smell GPT"; // Using a built-in icon
    extension_1.myStatusBarItem.tooltip = "I'm ready. Happy coding with Code Smell GPT! :)";
}
exports.setLoadedSuccess = setLoadedSuccess;
function getUserKey() {
    return vscode.workspace.getConfiguration('vscode-code-smell-gpt').get('gptKey');
}
exports.getUserKey = getUserKey;
function registerUserKey() {
    const newUserGPTKey = getUserKey();
    if (newUserGPTKey) {
        (0, chat_1.initChat)(newUserGPTKey);
        if (isConfigError()) {
            setLoadedSuccess();
        }
    }
}
exports.registerUserKey = registerUserKey;
function reachToken(code, token = 20) {
    return code.split('\n').reduce((res, str) => ([...res, ...str.split(' ')]), []).filter(str => !_.isEmpty(str)).length > token;
}
exports.reachToken = reachToken;
//# sourceMappingURL=utils.js.map