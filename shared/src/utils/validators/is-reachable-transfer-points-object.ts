import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, isNumber, min } from 'class-validator';
import { makeValidator } from './make-validator';

export function isReachableTransferPoints(
    valueToBeValidated: unknown
): boolean {
    return (
        typeof valueToBeValidated === 'object' &&
        valueToBeValidated !== null &&
        Object.entries(valueToBeValidated).every(
            ([key, value]: [string, unknown]) =>
                isUUID(key, 4) &&
                typeof value === 'object' &&
                value !== null &&
                isNumber((value as { duration: number }).duration) &&
                min((value as { duration: number }).duration, 0)
        )
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsReachableTransferPoints(
    validationOptions?: ValidationOptions
) {
    return makeValidator(
        'isReachableTransferPoints',
        (value: unknown, args?: ValidationArguments) =>
            isReachableTransferPoints(value),
        validationOptions
    );
}
