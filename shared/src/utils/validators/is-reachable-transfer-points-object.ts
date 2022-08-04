import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, isNumber, min } from 'class-validator';
import { getMapValidator } from './get-map-validator';
import { makeValidator } from './make-validator';

export function isReachableTransferPoints(
    valueToBeValidated: unknown
): boolean {
    return getMapValidator<{ duration: number }>({
        keyValidator: (key) => isUUID(key, 4),
        valueTransformer: (value) => value as { duration: number },
        valueValidator: (value) =>
            typeof value === 'object' &&
            value !== null &&
            isNumber(value.duration) &&
            min(value.duration, 0),
    })(valueToBeValidated);
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
