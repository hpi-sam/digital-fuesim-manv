import { promises as fs } from 'node:fs';
import type { BenchmarkResult } from './benchmark-file';
import { benchmarkFile } from './benchmark-file';
import { printError } from './print-error';

const pathToData = 'data';

console.log('Starting benchmarks');

const filenames = await fs.readdir(pathToData);
const fileBenchmarkResults: BenchmarkResult[] = [];

for (const filename of filenames) {
    // eslint-disable-next-line no-await-in-loop
    const benchmarkResult = await benchmarkFile(`${pathToData}/${filename}`);
    if (benchmarkResult) {
        fileBenchmarkResults.push(benchmarkResult);
    }
}

// Print the end results to the console
console.table(
    fileBenchmarkResults
        .map((result) => ({
            fileName: result.fileName,
            fileSize: `${(result.fileSize / 1024 / 1024).toPrecision(2)}MB`,
            '#actions': result.numberOfActions,
            ...Object.fromEntries(
                result.benchmarks.map(({ name, time }) => [
                    name,
                    `${Math.round(time)}ms`,
                ])
            ),
            consistent: result.benchmarkResultsWereConsistent,
        }))
        // We don't want an extra column for the array index
        .reduce<{ [fileName: string]: any }>((table, { fileName, ...rest }) => {
            table[fileName] = rest;
            return table;
        }, {})
);
if (
    fileBenchmarkResults.some(
        ({ benchmarkResultsWereConsistent }) => !benchmarkResultsWereConsistent
    )
) {
    printError(
        `Some exercises were not consistent!
This most likely means that a reducer is either not deterministic or makes some assumptions about immer specific stuff (use of "original()").
To further debug this, you should log the endStates of the respective exercises and can compare them directly in vscode via "Compare file with".`
    );
}
