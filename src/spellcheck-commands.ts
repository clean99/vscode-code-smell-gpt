/** Defines the functions for spellcheck-related commands. */

import * as vscode from 'vscode';

import { refreshDiagnostics } from './diagnostics';
import { spellCheck } from './spellcheck';

export const spellCheckByAll = () =>
  spellCheckWithProgress('code spelling');

/** Calls `spellCheck()` with progress bar, and `refreshDiagnostics()`. */
function spellCheckWithProgress(
  title: string
): void {
  const editor = vscode.window.activeTextEditor;

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: editor ? title : 'There is no document to check the spelling/grammar.',
      cancellable: true,
    },
    async () => {
      if (editor) {
        try {
          await spellCheck(editor.document);
        } catch (err: any) {
          vscode.window.showInformationMessage(err);
        }
        refreshDiagnostics(editor.document);
      }
    },
  );
}
