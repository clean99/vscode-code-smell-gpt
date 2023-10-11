import * as Diff from 'diff';
import * as _ from 'lodash';

export function extractAddedLines(diff: string): string[] {
    // Split the diff into lines and filter for added code
    return diff
        .split('\n')
        .filter(line => line.startsWith('+'))
        .map(line => line.slice(1,))
        .join('\n')
        .split('++ code')
        .filter(item => !_.isEmpty(item));
}

export function findDifferences(code1: string, code2: string): string[] {
    // Generate the diff
    const diff = Diff.createPatch('code', code1, code2);
    console.log('addedLines1', diff);
    const addedLines = extractAddedLines(diff);
    console.log('addedLines', addedLines);
    // Return the formatted diff
    return addedLines;
}
