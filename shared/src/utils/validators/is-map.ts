import { plainToInstance, Transform } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';
import { ValidateNested } from 'class-validator';
import type { Constructor } from '../constructor';
import { combineDecorators } from './combine-decorators';
import type { GenericPropertyDecorator } from './generic-property-decorator';

// An `isMap` function is omitted.
// It's currently not used and it's not trivial to migrate the decorator approach below
// to a standalone function.
// For reference, a similar implementation (for IdMaps) once existed as part of https://github.com/hpi-sam/digital-fuesim-manv/pull/125.

/**
 * A `Map` is of type `{ readonly [key in TKey]: TValue }`
 *
 * @param keyValidator A function that takes a supposed key and checks whether it is correct.
 * @param getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsMap<
    TKey extends number | string | symbol,
    TValue extends object,
    Each extends boolean = false
>(
    type: Constructor<TValue>,
    keyValidator: (key: unknown) => key is TKey,
    getId: (value: TValue) => TKey = (value) => (value as { id: TKey }).id,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key in TKey]: TValue }, Each> {
    const transform = Transform(
        (params) => {
            const plainChildren = params.value as { [key in TKey]: TValue };
            if (Object.keys(plainChildren).some((key) => !keyValidator(key))) {
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
    return combineDecorators(transform, validateNested);
}
