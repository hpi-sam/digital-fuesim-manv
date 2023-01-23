import type { ValidationOptions } from 'class-validator';
import { isUUID } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { IsMap } from './is-map';

// An `isIdMap` function is omitted.
// It is currently not used and it could be difficult to derive such a standalone function from the decorator.

/**
 * An `IdMap` is of type `{ readonly [key: UUID]: T }`
 *
 * @param getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsIdMap<T extends object, Each extends boolean = false>(
    type: Constructor<T>,
    getId: (value: T) => UUID = (value) => (value as { id: UUID }).id,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key: UUID]: T }, Each> {
    return IsMap<UUID, T, Each>(
        type,
        ((key) => isUUID(key, 4)) as (key: unknown) => key is UUID,
        getId,
        validationOptions
    );
}
