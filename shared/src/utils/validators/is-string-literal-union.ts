import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { makeValidator } from './make-validator';

export type AllowedValues<T extends string> = { [key in T]: true };

export function isStringLiteralUnion<T extends string>(
    allowedValues: AllowedValues<T>,
    valueToBeValidated: unknown
): boolean {
    return (
        typeof valueToBeValidated === 'string' &&
        allowedValues[valueToBeValidated as T]
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringLiteralUnion<T extends string>(
    allowedValues: AllowedValues<T>,
    validationOptions?: ValidationOptions
) {
    return makeValidator(
        'isStringLiteralUnion',
        (value: unknown, args?: ValidationArguments) =>
            isStringLiteralUnion<T>(allowedValues, value),
        validationOptions
    );
}
