/** Defines `CodesmellIgnore` class. */

import * as fs from 'fs';
import { Minimatch } from 'minimatch';

/**
 * `CodesmellIgnore` class having glob patterns to match typo tokens. If a token
 * is matched to a glob pattern, it's ignored.
 */
export class CodesmellIgnore {
  constructor() {
    this.myMatches = CodesmellIgnore.get();
  }

  /** Checks if token matches content of `.Codesmell-ignore` */
  match = (token: string) =>
    this.myMatches.match(token);

  /** Checks if valid content of `.Codesmell-ignore` is empty */
  empty = () => this.myMatches.empty;


  /** File path of `.Codesmell-ignore` */
  private static readonly path = `${
    process.env.HOME || process.env.USERPROFILE
  }/.Codesmell-ignore`;

  /** Glob patterns in `.Codesmell-ignore`. */
  private static readonly emptyMatches = new Minimatch('');
  private static matches = CodesmellIgnore.emptyMatches;

  /** Last modified time of `.Codesmell-ignore` */
  private static lastModified = -1;

  /** Latest glob patterns. */
  private myMatches;

  /** Adds a glob pattern to the end of file */
  static append = (pattern: string): void => {
    fs.writeFileSync(
      CodesmellIgnore.path,
      CodesmellIgnore.needLN() ? `\n${pattern}\n` : `${pattern}\n`,
      { flag: 'a' },
    );
  };

  /** Checks if the last char of the content of `.Codesmell-ignore` is '\n'. */
  private static needLN() {
    const matches = CodesmellIgnore.get();

    if (
      matches.empty ||
      matches.pattern.lastIndexOf(',}') === matches.pattern.length - 2
    ) {
      return false;
    }
    return true;
  }

  /** Reads glob patterns in `.Codesmell-ignore`. */
  private static get() {
    try {
      const stat = fs.statSync(CodesmellIgnore.path);

      if (stat === undefined) {
        CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
        return CodesmellIgnore.matches;
      }

      if (CodesmellIgnore.lastModified === stat.mtimeMs) {
        return CodesmellIgnore.matches;
      }

      CodesmellIgnore.lastModified = stat.mtimeMs;

      const ignores = `{${fs
        .readFileSync(CodesmellIgnore.path, 'utf8')
        .replace(/[,{}]/g, '\\$&')
        .replace(/\n\n*/g, ',')}}`;

      if (ignores.length >= 3) {
        CodesmellIgnore.matches = new Minimatch(ignores);
      } else {
        CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
      }
    } catch (err) {
      // @ts-ignore
      console.log(err.message);

      CodesmellIgnore.matches = CodesmellIgnore.emptyMatches;
    }
    return CodesmellIgnore.matches;
  }
}
