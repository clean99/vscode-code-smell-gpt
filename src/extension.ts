/**
 * Defines the functions for the code action commands, and registers all the
 * commands and `refreshDiagnostics`.
 */

import * as vscode from 'vscode';

import { CodespellTypo } from './typo';
import { DocumentsToTypos } from './spellcheck';
import { CodespellIgnore } from './ignore';
import { CodespellHistory } from './history';
import { CodespellCodeAction } from './codeaction';
import {
  spellCheckByAll,
} from './spellcheck-commands';
import {
  subscribeDiagnosticsToDocumentChanges,
  getCodespellDiagnostics,
  refreshDiagnostics,
} from './diagnostics';
import { initChat } from './chat';

/** Called once the extension is activated. */
export function activate(context: vscode.ExtensionContext) {
  CodespellHistory.backupIfTooLarge();
  const userGPTKey = vscode.workspace.getConfiguration('vscode-codespell').get<string>('gptKey');
  if(userGPTKey) {
    initChat(userGPTKey);
  } else {
    vscode.window.showInformationMessage(
      `Please config your gpt key first!`,
    );
  }
  
  // Subscribes `refreshDiagnostics` to documents change events.
  subscribeDiagnosticsToDocumentChanges(context);

  // Registers the code actions for `vscode-codespell.fixTypo`,
  // `vscode-codespell.fixAllTypos`, and `vscode-codespell.fixCommonTypos`.
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      '*',
      new CodespellCodeAction(),
      { providedCodeActionKinds: CodespellCodeAction.providedCodeActionKinds },
    ),
  );

  // Binds code action commands to corresponding functions.
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-codespell.fixTypo', fixTypo),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-codespell.ignoreTypo', ignoreTypo),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-codespell.fixAllTypos', fixAllTypos),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-codespell.fixCommonTypos',
      fixCommonTypos,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'vscode-codespell.spellCheckByAll',
      spellCheckByAll,
    ),
  );
}

/**
 * Fixes the typo of the given range of the document.
 *
 * Called by `vscode-codespell.fixTypo` code action command.
 */
function fixTypo(args: {
  document: vscode.TextDocument;
  range: vscode.Range | vscode.Selection;
  token: string;
  suggestion: string;
}) {
  const edit = new vscode.WorkspaceEdit();
  edit.replace(args.document.uri, args.range, args.suggestion);
  CodespellHistory.writeOnce(`${args.token} -> ${args.suggestion}\n`);
  vscode.workspace.applyEdit(edit);
}

/**
 * Adds given token to `~/.codespell-ignore`).
 *
 * Called by `vscode-codespell.ignoreTypo` code action command.
 */
function ignoreTypo(args: { document: vscode.TextDocument; token: string }) {
  CodespellIgnore.append(args.token);
  const typos = DocumentsToTypos.getTypos(args.document);
  DocumentsToTypos.setTypos(
    args.document,
    typos.filter((typo: CodespellTypo) => typo.token !== args.token),
  );
  refreshDiagnostics(args.document);
}

/**
 * Fixes all the typos of the document.
 *
 * Called by `vscode-codespell.fixAllTypos` code action command.
 */
function fixAllTypos(args: { document: vscode.TextDocument }) {
  const edit = new vscode.WorkspaceEdit();
  const uri = args.document.uri;
  const hist = new CodespellHistory();

  getCodespellDiagnostics(args.document).forEach((diagnostic) => {
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
 * Called by `vscode-codespell.fixCommonTypos` code action command.
 */
function fixCommonTypos(args: { document: vscode.TextDocument }) {
  const edit = new vscode.WorkspaceEdit();
  const uri = args.document.uri;
  const hist = new CodespellHistory();

  getCodespellDiagnostics(args.document).forEach((diagnostic) => {
    if (!diagnostic.suggestions.length || !diagnostic.typo.isCommon) {
      return;
    }
    edit.replace(uri, diagnostic.range, diagnostic.suggestions[0]);
    hist.write(`${diagnostic.token} -> ${diagnostic.suggestions[0]}\n`);
  });

  vscode.workspace.applyEdit(edit);
  hist.end();
}
