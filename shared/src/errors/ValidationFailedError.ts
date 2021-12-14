import { ValidationError } from 'class-validator';

export class ValidationFailedError extends Error {
    public readonly errors: ValidationError[];

    public constructor(errors: ValidationError[]) {
        super('The validation failed');
        this.errors = errors;
    }
}
