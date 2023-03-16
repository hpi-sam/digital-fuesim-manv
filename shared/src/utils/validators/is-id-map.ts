import { plainToInstance, Transform } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';
import { isUUID, ValidateNested } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';
import { combineDecorators } from './combine-decorators';
import type { GenericPropertyDecorator } from './generic-property-decorator';

// An `isIdMap` function is omitted.
// It's currently not used and it's not trivial to migrate the decorator approach below
// to a standalone function.
// For reference, such an implementation once existed as part of https://github.com/hpi-sam/digital-fuesim-manv/pull/125.

/**
 * An `IdMap` is of type `{ readonly [key: UUID]: T }`
 *
 * @property getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsIdMap<T extends object, Each extends boolean = false>(
    type: Constructor<T>,
    getId: (value: T) => UUID = (value) => (value as { id: UUID }).id,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key: UUID]: T }, Each> {
    return IsMultiTypedIdMap(() => type, getId, validationOptions);
}

/**
 * An `IdMap` is of type `{ readonly [key: UUID]: T }`
 * This validates IdMaps that can contain multiple types.
 *
 * @property getConstructor A function to get the constructor for a given plain object. Return a falsy value if the constructor cannot be determined which is invalid. Usually dispatches on the `.type` property.
 * @property getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsMultiTypedIdMap<
    T extends Constructor,
    Each extends boolean = false
>(
    getConstructor: (value: InstanceType<T>) => T | undefined,
    getId: (value: InstanceType<T>) => UUID = (value) =>
        (value as { id: UUID }).id,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key: UUID]: InstanceType<T> }, Each> {
    const transform = Transform(
        ({ value }) => {
            const plainMap = value as { [key: UUID]: InstanceType<T> };
            if (
                Object.entries(plainMap).some(
                    ([key, plain]) => !isUUID(key, 4) || key !== getId(plain)
                )
            ) {
                return 'invalid';
            }
            const plainWithConstructor = Object.values(plainMap).map(
                (entry) => [entry, getConstructor(entry)] as const
            );
            if (plainWithConstructor.some(([_, constr]) => !constr)) {
                return 'invalid';
            }
            const instances = plainWithConstructor.map(([entry, constr]) =>
                plainToInstance(constr!, entry)
            );
            return instances;
        },
        { toClassOnly: true }
    );
    const validateNested = ValidateNested({ ...validationOptions, each: true });
    return combineDecorators(transform, validateNested);
}
