import { ValidationError } from 'class-validator';

export class ValidationFailedError extends Error {
    public readonly errors: ValidationError[] | string[];

    public constructor(errors: ValidationError[] | string[]) {
        super('The validation failed');
        this.errors = errors;
    }
}
