/**
 * This error gets thrown if an error in a reducer function occurs because the action isn't compatible to the state.
 */
export class ReducerError extends Error {
    public override readonly name = 'ReducerError';
}

export class ExpectedReducerError extends ReducerError {}
