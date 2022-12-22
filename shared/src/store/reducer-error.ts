/**
 * This error gets thrown if an error in a reducer function occurs because the action isn't compatible to the state.
 */
// Because the Error class is environment specific, extending built ins can make trouble when transpiling
export class ReducerError {
    public readonly name = 'ReducerError';

    // eslint-disable-next-line unicorn/error-message
    public readonly stack? = new Error().stack;

    constructor(public readonly message: string) {}
}
