import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID } from 'class-validator';
import { getMapValidator } from './get-map-validator';
import { makeValidator } from './make-validator';

export function isUUIDSet(valueToBeValidated: unknown): boolean {
    return getMapValidator<true>({
        keyValidator: (key) => isUUID(key, 4),
        valueValidator: (value) => value === true,
    })(valueToBeValidated);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsUUIDSet(validationOptions?: ValidationOptions) {
    return makeValidator(
        'isUUIDSet',
        (value: unknown, args?: ValidationArguments) => isUUIDSet(value),
        validationOptions
    );
}
