/** Defines `CodesmellHistory` class. */

import * as fs from 'fs';

/** `CodesmellHistory` class providing log writing. */
export class CodesmellHistory {
  constructor() {
    this.stream = fs.createWriteStream(CodesmellHistory.path, {
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
    fs.writeFile(CodesmellHistory.path, log, { flag: 'a' }, (_) => {});
  }

  /**
   * Stats history file size, and renames it to a backup file when it is too
   * large.
   */
  public static backupIfTooLarge(): void {
    try {
      const stat = fs.statSync(CodesmellHistory.path);
      if (stat === undefined) {
        return;
      }
      if (stat.size > 10 * 1024 * 1024) {
        for (let i = 1; i < 10000; ++i) {
          const newPath = `${CodesmellHistory.path}.${i}`;
          if (!fs.existsSync(newPath)) {
            fs.rename(CodesmellHistory.path, newPath, (_) => {});
            return;
          }
        }
      }
    } catch (err) {}
  }

  /** File path of `.Codesmell-history` */
  private static readonly path = `${
    process.env.HOME || process.env.USERPROFILE
  }/.Codesmell-history`;
}
