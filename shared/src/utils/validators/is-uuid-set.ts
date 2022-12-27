import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID } from 'class-validator';
import type { UUID } from '../uuid';
import type { UUIDSet } from '../uuid-set';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export const isUUIDSet = createMapValidator<UUID, true>({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    keyValidator: <(key: unknown) => key is UUID>((key) => isUUID(key, 4)),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valueValidator: <(value: unknown) => value is true>(
        ((value) => value === true)
    ),
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsUUIDSet<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<UUIDSet, Each> {
    return makeValidator<UUIDSet, Each>(
        'isUUIDSet',
        (value: unknown, args?: ValidationArguments) => isUUIDSet(value),
        validationOptions
    );
}
