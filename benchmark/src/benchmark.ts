import { promises as fs } from 'node:fs';
import os from 'node:os';
import { print } from './print';
import { steps, StepState } from './steps';

// Print some information about the system
console.log(`
System Information:
  OS:      ${os.version()} ${os.release()}
  #CPUs:   ${os.cpus().length}
  RAM:     ${Math.round(os.totalmem() / 1024 / 1024)}MB
  Node.js: ${process.version}

`);

const pathToData = 'data';

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

async function benchmarkFile(
    filename: string
): Promise<BenchmarkResult | undefined> {
    const path = `${pathToData}/${filename}`;
    let data;
    try {
        // eslint-disable-next-line no-await-in-loop
        data = await fs.readFile(path, 'utf8');
    } catch {
        print(`Could not read file ${filename}\n`, 'red');
        return;
    }
    const fileSize = (await fs.stat(path)).size;
    console.log(filename);
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch {
        print('Error while parsing state export\n', 'red');
        return;
    }

    const stepState = new StepState(parsedData);
    for (const step of steps) {
        try {
            step.run(stepState);
        } catch {
            print(`Error in step ${step.name}\n`, 'red');
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
print('\n');
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
    print(
        `Some exercises were not consistent!
This most likely means that a reducer is either not deterministic or makes some assumptions about immer specific stuff (use of "original()").
To further debug this, you should log the endStates of the respective exercises and can compare them directly in vscode via "Compare file with".
`,
        'red'
    );
}
