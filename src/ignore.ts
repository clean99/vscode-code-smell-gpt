/** Defines `CodespellIgnore` class. */

import * as fs from 'fs';
import { Minimatch } from 'minimatch';

/**
 * `CodespellIgnore` class having glob patterns to match typo tokens. If a token
 * is matched to a glob pattern, it's ignored.
 */
export class CodespellIgnore {
  constructor() {
    this.myMatches = CodespellIgnore.get();
  }

  /** Checks if token matches content of `.codespell-ignore` */
  match = (token: string) =>
    this.myMatches.match(token);

  /** Checks if valid content of `.codespell-ignore` is empty */
  empty = () => this.myMatches.empty;


  /** File path of `.codespell-ignore` */
  private static readonly path = `${
    process.env.HOME || process.env.USERPROFILE
  }/.codespell-ignore`;

  /** Glob patterns in `.codespell-ignore`. */
  private static readonly emptyMatches = new Minimatch('');
  private static matches = CodespellIgnore.emptyMatches;

  /** Last modified time of `.codespell-ignore` */
  private static lastModified = -1;

  /** Latest glob patterns. */
  private myMatches;

  /** Adds a glob pattern to the end of file */
  static append = (pattern: string): void => {
    fs.writeFileSync(
      CodespellIgnore.path,
      CodespellIgnore.needLN() ? `\n${pattern}\n` : `${pattern}\n`,
      { flag: 'a' },
    );
  };

  /** Checks if the last char of the content of `.codespell-ignore` is '\n'. */
  private static needLN() {
    const matches = CodespellIgnore.get();

    if (
      matches.empty ||
      matches.pattern.lastIndexOf(',}') === matches.pattern.length - 2
    ) {
      return false;
    }
    return true;
  }

  /** Reads glob patterns in `.codespell-ignore`. */
  private static get() {
    try {
      const stat = fs.statSync(CodespellIgnore.path);

      if (stat === undefined) {
        CodespellIgnore.matches = CodespellIgnore.emptyMatches;
        return CodespellIgnore.matches;
      }

      if (CodespellIgnore.lastModified === stat.mtimeMs) {
        return CodespellIgnore.matches;
      }

      CodespellIgnore.lastModified = stat.mtimeMs;

      const ignores = `{${fs
        .readFileSync(CodespellIgnore.path, 'utf8')
        .replace(/[,{}]/g, '\\$&')
        .replace(/\n\n*/g, ',')}}`;

      if (ignores.length >= 3) {
        CodespellIgnore.matches = new Minimatch(ignores);
      } else {
        CodespellIgnore.matches = CodespellIgnore.emptyMatches;
      }
    } catch (err) {
      // @ts-ignore
      console.log(err.message);

      CodespellIgnore.matches = CodespellIgnore.emptyMatches;
    }
    return CodespellIgnore.matches;
  }
}
