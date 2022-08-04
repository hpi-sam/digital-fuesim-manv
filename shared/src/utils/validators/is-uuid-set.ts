import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID } from 'class-validator';
import { makeValidator } from './make-validator';

export function isUUIDSet(valueToBeValidated: unknown): boolean {
    return (
        typeof valueToBeValidated === 'object' &&
        valueToBeValidated !== null &&
        Object.entries(valueToBeValidated).every(
            ([key, value]) => isUUID(key, 4) && value === true
        )
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsUUIDSet(validationOptions?: ValidationOptions) {
    return makeValidator(
        'isUUIDSet',
        (value: unknown, args?: ValidationArguments) => isUUIDSet(value),
        validationOptions
    );
}
