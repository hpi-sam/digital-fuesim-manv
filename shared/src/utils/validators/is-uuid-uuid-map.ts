import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { isUUID } from 'class-validator';
import type { UUID } from '../uuid';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export type UUIDSquaredMap = { [key in UUID]: UUID };

export const isUUIDSquaredMap = createMapValidator<UUID, UUID>({
    keyValidator: ((key) => isUUID(key, 4)) as (key: unknown) => key is UUID,
    valueValidator: ((value) => isUUID(value, 4)) as (
        value: unknown
    ) => value is UUID,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsUUIDSquaredMap<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<UUIDSquaredMap, Each> {
    return makeValidator<UUIDSquaredMap, Each>(
        'isUUIDSquaredMap',
        (value: unknown, args?: ValidationArguments) => isUUIDSquaredMap(value),
        validationOptions
    );
}
