/**
 * Defines the functions for the code action commands, and registers all the
 * commands and `refreshDiagnostics`.
 */

import * as vscode from 'vscode';

import { CodesmellTypo } from './typo';
import { DocumentsToTypos } from './spellcheck';
import { CodesmellIgnore } from './ignore';
import { CodesmellHistory } from './history';
import { CodesmellCodeAction } from './codeaction';
import {
  spellCheckByAll,
} from './spellcheck-commands';
import {
  subscribeDiagnosticsToDocumentChanges,
  getCodesmellDiagnostics,
  refreshDiagnostics,
} from './diagnostics';
import { initChat } from './chat';
import { getUserKey, setConfigError, setInitLoading, setLoadedSuccess } from './utils';

export const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

/** Called once the extension is activated. */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(myStatusBarItem);
  const userGPTKey = getUserKey();
  setInitLoading();
  myStatusBarItem.show();
  CodesmellHistory.backupIfTooLarge();
  
  if(userGPTKey) {
    initChat(userGPTKey);
    setLoadedSuccess();
  } else {
    setConfigError();
    const checkAPIKey = vscode.workspace.onDidSaveTextDocument(async document => {
      const newUserGPTKey = getUserKey();
      if(newUserGPTKey) {
        initChat(newUserGPTKey);
        checkAPIKey.dispose();
        setLoadedSuccess();
      }
    });
  
  
    // Register disposable
    context.subscriptions.push(checkAPIKey);
    return;
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
    vscode.commands.registerCommand('vscode-code-smell-gpt.ignoreTypo', ignoreTypo),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-code-smell-gpt.fixAllTypos', fixAllTypos),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-code-smell-gpt.fixCommonTypos',
      fixCommonTypos,
    ),
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
  CodesmellHistory.writeOnce(`${args.token} -> ${args.suggestion}\n`);
  vscode.workspace.applyEdit(edit);
}

/**
 * Adds given token to `~/.Codesmell-ignore`).
 *
 * Called by `vscode-code-smell-gpt.ignoreTypo` code action command.
 */
function ignoreTypo(args: { document: vscode.TextDocument; token: string }) {
  CodesmellIgnore.append(args.token);
  const typos = DocumentsToTypos.getTypos(args.document);
  DocumentsToTypos.setTypos(
    args.document,
    typos.filter((typo: CodesmellTypo) => typo.token !== args.token),
  );
  refreshDiagnostics(args.document);
}

/**
 * Fixes all the typos of the document.
 *
 * Called by `vscode-code-smell-gpt.fixAllTypos` code action command.
 */
function fixAllTypos(args: { document: vscode.TextDocument }) {
  const edit = new vscode.WorkspaceEdit();
  const uri = args.document.uri;
  const hist = new CodesmellHistory();

  getCodesmellDiagnostics(args.document).forEach((diagnostic) => {
    if (!diagnostic.suggestions.length) {
      return;
    }
    edit.replace(uri, diagnostic.range, diagnostic.suggestions[0]);
    hist.write(`${diagnostic.token} -> ${diagnostic.suggestions[0]}\n`);
  });

  vscode.workspace.applyEdit(edit);
  hist.end();
}

/**
 * Fixes all the typos of the document common in PNU and DAUM services.
 *
 * Called by `vscode-code-smell-gpt.fixCommonTypos` code action command.
 */
function fixCommonTypos(args: { document: vscode.TextDocument }) {
  const edit = new vscode.WorkspaceEdit();
  const uri = args.document.uri;
  const hist = new CodesmellHistory();

  getCodesmellDiagnostics(args.document).forEach((diagnostic) => {
    if (!diagnostic.suggestions.length || !diagnostic.typo.isCommon) {
      return;
    }
    edit.replace(uri, diagnostic.range, diagnostic.suggestions[0]);
    hist.write(`${diagnostic.token} -> ${diagnostic.suggestions[0]}\n`);
  });

  vscode.workspace.applyEdit(edit);
  hist.end();
}
