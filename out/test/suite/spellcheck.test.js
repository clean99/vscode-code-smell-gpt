"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const match = require("minimatch");
suite('SpellCheck Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('minimatch test', () => {
        assert.strictEqual(true, match('a/a', 'a/**'));
        assert.strictEqual(true, match('a/a', '{a/**,}'));
        assert.strictEqual(true, match('a', '{a,}'));
        assert.strictEqual(true, match('a/', '{a/**,}'));
        assert.strictEqual(true, match('a/a', 'a*/**'));
        assert.strictEqual(false, match('a/a', 'a*'));
        assert.strictEqual(true, match('[a.a/', '*[[!.a-zA-Z0-9:<>]*[[!.a-zA-Z0-9:<>]*'));
        assert.strictEqual(true, match('[a.a/a/b/c', '*[[!.a-zA-Z0-9:<>]*[[!.a-zA-Z0-9:<>]*/**'));
        assert.strictEqual(true, match('[a.a', '*[[!.a-zA-Z0-9:<>]*[[!.a-zA-Z0-9:<>]*'));
    });
});
//# sourceMappingURL=spellcheck.test.js.map