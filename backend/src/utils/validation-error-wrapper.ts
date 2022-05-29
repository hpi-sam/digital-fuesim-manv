import type { ValidationError } from 'class-validator';

export class ValidationErrorWrapper extends Error {
    public constructor(public readonly errors: (ValidationError | string)[]) {
        super('Errors occurred while validating');
    }
}
