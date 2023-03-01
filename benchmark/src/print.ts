/**
 * Prints a string to the console
 *
 * Be aware that this function does not add a newline at the end.
 * This means that you can create multicolor lines by calling this function multiple times.
 * ````
 * print('Hello ', 'red');
 * print('World!\n', 'green');
 * ```
 */
export function print(
    text: string,
    color: keyof typeof colorEscapeCodes | null = null
) {
    process.stdout.write(
        `${color ? colorEscapeCodes[color] : ''}${text}${resetCode}`
    );
}

// See https://stackoverflow.com/a/41407246/104380
const colorEscapeCodes = {
    blue: '\x1B[34m',
    cyan: '\x1B[36m',
    gray: '\x1B[90m',
    green: '\x1B[32m',
    magenta: '\x1B[35m',
    red: '\x1B[31m',
    white: '\x1B[37m',
    yellow: '\x1B[33m',
};

const resetCode = '\x1B[0m';
