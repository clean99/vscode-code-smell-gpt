/** Defines `CodesmellTypo` type. */

import * as vscode from 'vscode';

/** Carries the information of a typo. */
export type CodesmellTypo = {
  // Typo token.
  token: string;
  // Suggestions for fixing typo.
  suggestion: string;
  // Typo info.
  info: string;
  // Line Count.
  lineCount: number;
  // Only DAUM service returns `type` ('space', 'spell'...).
  type?: string;
  // RegExp of token.
  regex?: RegExp;
  // Diagnostic severity from `~/.Codesmell-bad-expressions.json`.
  severity?: vscode.DiagnosticSeverity;
  // Checks if the typo appears both in PNU and DAUM services.
  isCommon?: boolean;
  // Checks if the typo is from `~/.Codesmell-typos`.
  isLocal?: boolean;
};
