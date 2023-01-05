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
    return combineDecorators(transform, validateNested);
}
