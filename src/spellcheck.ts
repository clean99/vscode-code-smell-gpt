/** Defines `DocumentsToTypos` class and `spellCheck()` function. */

import * as vscode from 'vscode';
import { CodesmellTypo } from './typo';
import { getTypos } from './chat';
import { setLoadedSuccess, setSpinning } from './utils';

/** Class for dictionary of `vscode.TextDocument` to `CodesmellTypo[]`. */
export class DocumentsToTypos {
  /** Dictionary of `vscode.TextDocument` to `CodesmellTypo[]`. */
  private static docs2typos = new WeakMap();

  /** Gets typos of the document. */
  static getTypos = (doc: vscode.TextDocument) =>
    DocumentsToTypos.docs2typos.get(doc);

  /** Sets typos of the document. */
  static setTypos = (doc: vscode.TextDocument, typos: CodesmellTypo[]) =>
    DocumentsToTypos.docs2typos.set(doc, typos);
}

/**
 * Spell checks given document, makes `CodesmellTypo[]`, and sets them to
 * `DocumentsToTypos`.
 */
export async function spellCheck(
  document: vscode.TextDocument,
  differences?: string[]
): Promise<void> {
  setSpinning();
  try{
    const doc = document;
    const text = differences ? differences.join('「」') : doc.getText();
    const typos = await getTypos(text);
    const previousTypos = DocumentsToTypos.getTypos(doc) ?? [];
    DocumentsToTypos.setTypos(doc, [...previousTypos, ...typos]);
  } catch(e) {
    console.log('error', e);
  } finally {
    setLoadedSuccess();
  }
}
