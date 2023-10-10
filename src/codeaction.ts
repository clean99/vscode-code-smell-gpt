/**
 * Defines `CodespellCodeAction` class.
 *
 * `CodespellTypo` makes `CodespellDiagnostic` makes `CodespellCodeAction`.
 */

import * as vscode from 'vscode';
import { CODE_SPELL_MENTION, CodespellDiagnostic } from './diagnostics';

/**
 * Provides code actions for the commands of `vscode-codespell.fixTypo` and
 * `vscode-codespell.fixAllTypos`.
 */
export class CodespellCodeAction implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix,
  ];

  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken,
  ): vscode.CodeAction[] {
    let actions: vscode.CodeAction[] = [];
    const ignores: vscode.CodeAction[] = [];

    const codespellDiagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.code === CODE_SPELL_MENTION,
    ) as CodespellDiagnostic[];

    if (!codespellDiagnostics.length) {
      return [];
    }

    codespellDiagnostics.forEach((diagnostic) => {
      actions = actions.concat(
        this.createFixTypoCommandCodeActions(diagnostic, document),
      );
    });

    actions = actions.concat(ignores);

    if (!actions.length) {
      return actions;
    }

    if (
      codespellDiagnostics.some(
        (diagnostic) => diagnostic.typo.isCommon === true,
      )
    ) {
      const action = new vscode.CodeAction(
        'quick fix',
        vscode.CodeActionKind.QuickFix,
      );

      action.command = {
        command: 'vscode-codespell.fixCommonTypos',
        title: 'Fix common typos',
        arguments: [{ document }],
      };

      actions.push(action);
    }

    return actions;
  }

  private createFixTypoCommandCodeActions(
    diagnostic: CodespellDiagnostic,
    document: vscode.TextDocument,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    diagnostic.suggestions.forEach((suggestion: string) => {
      const action = new vscode.CodeAction(
        `⤷ ${suggestion}`,
        vscode.CodeActionKind.QuickFix,
      );
      action.command = {
        command: 'vscode-codespell.fixTypo',
        title: 'Fix a typo',
        arguments: [
          {
            document,
            suggestion,
            token: diagnostic.token,
            range: diagnostic.range,
          },
        ],
      };

      actions.push(action);
    });

    if (actions.length) {
      actions[0].isPreferred = true;
    }

    return actions;
  }
}
