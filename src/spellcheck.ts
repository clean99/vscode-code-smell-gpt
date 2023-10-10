/** Defines `DocumentsToTypos` class and `spellCheck()` function. */

import * as vscode from 'vscode';
import { CodespellTypo } from './typo';
import { getTypos } from './chat';

/** Class for dictionary of `vscode.TextDocument` to `CodespellTypo[]`. */
export class DocumentsToTypos {
  /** Dictionary of `vscode.TextDocument` to `CodespellTypo[]`. */
  private static docs2typos = new WeakMap();

  /** Gets typos of the document. */
  static getTypos = (doc: vscode.TextDocument) =>
    DocumentsToTypos.docs2typos.get(doc);

  /** Sets typos of the document. */
  static setTypos = (doc: vscode.TextDocument, typos: CodespellTypo[]) =>
    DocumentsToTypos.docs2typos.set(doc, typos);
}

/**
 * Spell checks given document, makes `CodespellTypo[]`, and sets them to
 * `DocumentsToTypos`.
 */
export async function spellCheck(
  editor: vscode.TextEditor,
): Promise<void> {
  const doc = editor.document;
  const text = doc.getText(
    editor.selection.isEmpty ? undefined : editor.selection,
  );

  const typos = await getTypos(text);

  DocumentsToTypos.setTypos(doc, typos);
}
