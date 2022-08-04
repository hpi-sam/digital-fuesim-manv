import { plainToInstance } from 'class-transformer';
import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, validateSync } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';
import { getMapValidator } from './get-map-validator';
import { makeValidator } from './make-validator';

export function isIdMap<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID,
    valueToBeValidated: unknown
): boolean {
    return getMapValidator({
        keyValidator: (key) => isUUID(key, 4),
        valueTransformer: (value) => plainToInstance(type, value),
        valueValidator: (value) => validateSync(value).length === 0,
        consistencyValidator: (key, value) => getId(value) === key,
    })(valueToBeValidated);
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
