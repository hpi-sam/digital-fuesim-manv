import { plainToInstance, Transform } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';
import { isUUID, ValidateNested } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';
import { applyDecorators } from './apply-decorators';
import { getMapValidator } from './get-map-validator';
import { isValidObject } from './is-valid-object';

export function isIdMap<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID,
    valueToBeValidated: unknown
): boolean {
    return getMapValidator({
        keyValidator: (key) => isUUID(key, 4),
        valueValidator: (value) => isValidObject(type, value),
        consistencyValidator: (key, value) =>
            getId(plainToInstance(type, value)) === key,
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
    const transform = Transform(
        (params) => {
            const plainChildren = params.value as { [key: UUID]: T };
            if (Object.keys(plainChildren).some((key) => !isUUID(key, 4))) {
                return 'invalid';
            }
            const instanceChildrenWithKey = Object.entries(plainChildren).map(
                ([key, plainChild]) =>
                    [key, plainToInstance(type, plainChild)] as const
            );
            if (
                instanceChildrenWithKey.some(
                    ([key, child]) => getId(child) !== key
                )
            ) {
                return 'invalid';
            }
            return instanceChildrenWithKey.map(([, child]) => child);
        },
        { toClassOnly: true }
    );
    const validateNested = ValidateNested({ ...validationOptions, each: true });
    return applyDecorators(transform, validateNested);
}
