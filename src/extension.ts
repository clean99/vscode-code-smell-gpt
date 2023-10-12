/**
 * Defines the functions for the code action commands, and registers all the
 * commands and `refreshDiagnostics`.
 */

import * as vscode from 'vscode';
import { CodesmellCodeAction } from './codeaction';
import {
  spellCheckByAll,
} from './spellcheck-commands';
import {
  subscribeDiagnosticsToDocumentChanges
} from './diagnostics';
import { initChat } from './chat';
import { getUserKey, registerUserKey, setConfigError, setInitLoading, setLoadedSuccess } from './utils';

export const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

/** Called once the extension is activated. */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(myStatusBarItem);
  const userGPTKey = getUserKey();
  myStatusBarItem.show();
  setInitLoading();

  if(userGPTKey) {
    initChat(userGPTKey);
    setLoadedSuccess();
  } else {
    setConfigError(`Code Smell GPT: Please config your gpt key first! XD \nFollow Instruction: https://github.com/clean99/vscode-code-smell-gpt/blob/main/README.md`,);
    registerUserKey();
  }
  
  
  // Subscribes `refreshDiagnostics` to documents change events.
  subscribeDiagnosticsToDocumentChanges(context);

  // Registers the code actions for `vscode-code-smell-gpt.fixTypo`,
  // `vscode-code-smell-gpt.fixAllTypos`, and `vscode-code-smell-gpt.fixCommonTypos`.
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      '*',
      new CodesmellCodeAction(),
      { providedCodeActionKinds: CodesmellCodeAction.providedCodeActionKinds },
    ),
  );

  // Binds code action commands to corresponding functions.
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-code-smell-gpt.fixTypo', fixTypo),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-code-smell-gpt.spellCheckByAll',
      spellCheckByAll,
    ),
  );
}

/**
 * Fixes the typo of the given range of the document.
 *
 * Called by `vscode-code-smell-gpt.fixTypo` code action command.
 */
function fixTypo(args: {
  document: vscode.TextDocument;
  range: vscode.Range | vscode.Selection;
  token: string;
  suggestion: string;
}) {
  const edit = new vscode.WorkspaceEdit();
  edit.replace(args.document.uri, args.range, args.suggestion);
  vscode.workspace.applyEdit(edit);
}
