import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isString } from 'class-validator';
import { makeValidator } from './make-validator';

// TODO: This should actually verify the type
export function isStringLiteralUnion(valueToBeValidated: unknown): boolean {
    return isString(valueToBeValidated);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringLiteralUnion(validationOptions?: ValidationOptions) {
    return makeValidator(
        'isStringLiteralUnion',
        (value: unknown, args?: ValidationArguments) =>
            isStringLiteralUnion(value),
        validationOptions
    );
}
