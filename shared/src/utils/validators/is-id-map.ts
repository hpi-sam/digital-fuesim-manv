import { plainToInstance } from 'class-transformer';
import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, validateSync } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';
import { makeValidator } from './make-validator';

export function isIdMap<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID,
    valueToBeValidated: unknown
): boolean {
    return (
        typeof valueToBeValidated === 'object' &&
        valueToBeValidated !== null &&
        Object.entries(valueToBeValidated).every(([key, value]) => {
            if (!isUUID(key, 4)) {
                return false;
            }
            const valueInstance = plainToInstance(type, value);
            const validationErrors = validateSync(valueInstance);
            if (validationErrors.length > 0) {
                return false;
            }
            if (getId(valueInstance) !== key) {
                return false;
            }
            return true;
        })
    );
}

/**
 * An `IdMap` is of type `{ [key: UUID]: T }`
 *
 * @property getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsIdMap<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID = (value) => (value as { id: UUID }).id,
    validationOptions?: ValidationOptions
) {
    return makeValidator(
        'isIdMap',
        (value: unknown, args?: ValidationArguments) =>
            isIdMap(type, getId, value),
        validationOptions
    );
}
