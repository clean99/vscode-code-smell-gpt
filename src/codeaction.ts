/**
 * Defines `CodesmellCodeAction` class.
 *
 * `CodesmellTypo` makes `CodesmellDiagnostic` makes `CodesmellCodeAction`.
 */

import * as vscode from 'vscode';
import { CODE_SMELL_MENTION, CodesmellDiagnostic } from './diagnostics';
import * as _ from 'lodash';

/**
 * Provides code actions for the commands of `vscode-code-smell-gpt.fixTypo` and
 * `vscode-code-smell-gpt.fixAllTypos`.
 */
export class CodesmellCodeAction implements vscode.CodeActionProvider {
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

    const CodesmellDiagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.code === CODE_SMELL_MENTION,
    ) as CodesmellDiagnostic[];

    if (!CodesmellDiagnostics.length) {
      return [];
    }

    CodesmellDiagnostics.forEach((diagnostic) => {
      actions = actions.concat(
        this.createFixTypoCommandCodeActions(diagnostic, document),
      );
    });

    actions = actions.concat(ignores);

    if (!actions.length) {
      return actions;
    }

    if (
      CodesmellDiagnostics.some(
        (diagnostic) => diagnostic.typo.isCommon === true,
      )
    ) {
      const action = new vscode.CodeAction(
        'quick fix',
        vscode.CodeActionKind.QuickFix,
      );

      action.command = {
        command: 'vscode-code-smell-gpt.fixCommonTypos',
        title: 'Fix common typos',
        arguments: [{ document }],
      };

      actions.push(action);
    }

    return actions;
  }

  private createFixTypoCommandCodeActions(
    diagnostic: CodesmellDiagnostic,
    document: vscode.TextDocument,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    diagnostic.suggestions.forEach((suggestion: string) => {
      const action = new vscode.CodeAction(
        `Code Smell Suggest: ⤷ ${_.isEmpty(suggestion) ? 'remove code': suggestion}`,
        vscode.CodeActionKind.QuickFix,
      );
      action.command = {
        command: 'vscode-code-smell-gpt.fixTypo',
        title: 'Fix it',
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
