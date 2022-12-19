import { promises as fs } from 'node:fs';
import { printError } from './print-error';
import { steps, StepState } from './steps';

const pathToData = 'data';

console.log('Starting benchmarks');

const filenames = await fs.readdir(pathToData);
const fileBenchmarkResults: BenchmarkResult[] = [];

for (const filename of filenames) {
    // eslint-disable-next-line no-await-in-loop
    const benchmarkResult = await benchmarkFile(filename);
    if (benchmarkResult) {
        fileBenchmarkResults.push(benchmarkResult);
    }
}

interface BenchmarkResult {
    fileName: string;
    /**
     * Size of the file in bytes
     */
    fileSize: number;
    stepState: StepState;
}

export async function benchmarkFile(
    filename: string
): Promise<BenchmarkResult | undefined> {
    const path = `${pathToData}/${filename}`;
    let data;
    try {
        // eslint-disable-next-line no-await-in-loop
        data = await fs.readFile(path, 'utf8');
    } catch {
        printError(`Could not read file ${filename}`);
        return;
    }
    const fileSize = (await fs.stat(path)).size;
    console.log('Start benchmarks for', filename);
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (error: any) {
        printError('Error while parsing state export', error);
        return;
    }

    const stepState = new StepState(parsedData);
    for (const step of steps) {
        try {
            step.run(stepState);
        } catch (error: any) {
            printError(`Error in step ${step.name}`, error);
            return;
        }
    }
    return {
        fileName: filename,
        fileSize,
        stepState,
    };
}

// Print the end results to the console
console.table(
    fileBenchmarkResults
        .map((result) => ({
            fileName: result.fileName,
            fileSize: `${(result.fileSize / 1024 / 1024).toPrecision(2)}MB`,
            ...steps
                .map((step) => step.getColumnToPrint(result.stepState))
                .reduce((columns, column) => ({ ...columns, ...column }), {}),
        }))
        // We don't want an extra column for the array index
        .reduce<{ [fileName: string]: any }>((table, { fileName, ...rest }) => {
            table[fileName] = rest;
            return table;
        }, {})
);
if (fileBenchmarkResults.some(({ stepState }) => !stepState.isConsistent)) {
    printError(
        `Some exercises were not consistent!
This most likely means that a reducer is either not deterministic or makes some assumptions about immer specific stuff (use of "original()").
To further debug this, you should log the endStates of the respective exercises and can compare them directly in vscode via "Compare file with".`
    );
}
