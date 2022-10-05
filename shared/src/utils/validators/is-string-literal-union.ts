import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { StrictObject } from '../strict-object';
import { makeValidator } from './make-validator';

export function isStringLiteralUnion<T extends string>(
    allowedValues: { [key in T]: true },
    valueToBeValidated: unknown
): boolean {
    return (
        typeof valueToBeValidated === 'string' &&
        StrictObject.keys(allowedValues).includes(valueToBeValidated as T)
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringLiteralUnion<T extends string>(
    allowedValues: { [key in T]: true },
    validationOptions?: ValidationOptions
) {
    return makeValidator(
        'isStringLiteralUnion',
        (value: unknown, args?: ValidationArguments) =>
            isStringLiteralUnion<T>(allowedValues, value),
        validationOptions
    );
}
