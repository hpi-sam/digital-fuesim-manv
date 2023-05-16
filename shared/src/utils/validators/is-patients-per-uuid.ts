import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID } from 'class-validator';
import type { UUID } from '../uuid';
import type { ResourceDescription } from '../../models/utils/resource-description';
import type { PatientStatus } from '../../models/utils/patient-status';
import { patientStatusAllowedValues } from '../../models/utils/patient-status';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';
import { isResourceDescription } from './is-resource-description';

export const isPatientsPerUUID = createMapValidator<
    UUID,
    ResourceDescription<PatientStatus>
>({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    keyValidator: <(key: unknown) => key is UUID>((key) => isUUID(key, 4)),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valueValidator: (
        value: unknown
    ): value is ResourceDescription<PatientStatus> =>
        isResourceDescription(patientStatusAllowedValues, value),
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsPatientsPerUUID<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<
    { [key: UUID]: ResourceDescription<PatientStatus> },
    Each
> {
    return makeValidator<
        { [key: UUID]: ResourceDescription<PatientStatus> },
        Each
    >(
        'isPatientsPerUUID',
        (value: unknown, args?: ValidationArguments) =>
            isPatientsPerUUID(value),
        validationOptions
    );
}
