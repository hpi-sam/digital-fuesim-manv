export class DatabaseError extends Error {
    constructor(message: string, private readonly innerError?: Error) {
        super(message);
    }
}
