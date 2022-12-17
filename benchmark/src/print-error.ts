export function printError(...messages: any[]) {
    console.error('\x1B[31m%s\x1B[0m', ...messages, '\x1B[0m');
}
