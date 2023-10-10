/** Defines `CodespellHistory` class. */

import * as fs from 'fs';

/** `CodespellHistory` class providing log writing. */
export class CodespellHistory {
  constructor() {
    this.stream = fs.createWriteStream(CodespellHistory.path, {
      flags: 'a',
    });
  }

  private stream;

  write(log: string): boolean {
    return this.stream.write(log);
  }

  end(): void {
    this.stream.end();
  }

  public static writeOnce(log: string) {
    fs.writeFile(CodespellHistory.path, log, { flag: 'a' }, (_) => {});
  }

  /**
   * Stats history file size, and renames it to a backup file when it is too
   * large.
   */
  public static backupIfTooLarge(): void {
    try {
      const stat = fs.statSync(CodespellHistory.path);
      if (stat === undefined) {
        return;
      }
      if (stat.size > 10 * 1024 * 1024) {
        for (let i = 1; i < 10000; ++i) {
          const newPath = `${CodespellHistory.path}.${i}`;
          if (!fs.existsSync(newPath)) {
            fs.rename(CodespellHistory.path, newPath, (_) => {});
            return;
          }
        }
      }
    } catch (err) {}
  }

  /** File path of `.codespell-history` */
  private static readonly path = `${
    process.env.HOME || process.env.USERPROFILE
  }/.codespell-history`;
}
