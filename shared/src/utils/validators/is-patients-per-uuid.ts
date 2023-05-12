import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID } from 'class-validator';
import type { UUID } from '../uuid';
import type { UUIDSet } from '../uuid-set';
import type { PatientCount } from '../../models/radiogram';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';
import { isPatientCount } from './is-patient-count';

export const isPatientsPerUUID = createMapValidator<UUID, PatientCount>({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    keyValidator: <(key: unknown) => key is UUID>((key) => isUUID(key, 4)),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valueValidator: <(value: unknown) => value is PatientCount>(
        ((value) => isPatientCount(value))
    ),
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsPatientsPerUUID<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ [key: UUID]: PatientCount }, Each> {
    return makeValidator<UUIDSet, Each>(
        'isUUIDSet',
        (value: unknown, args?: ValidationArguments) =>
            isPatientsPerUUID(value),
        validationOptions
    );
}
