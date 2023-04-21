import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { isNumber, min } from 'class-validator';
import type { PatientCount } from '../../models/radiogram/patient-count-radiogram';
import type { PatientStatus } from '../../models/utils';
import { patientStatusAllowedValues } from '../../models/utils';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { isLiteralUnion } from './is-literal-union';
import { makeValidator } from './make-validator';

export const isPatientCount = createMapValidator<PatientStatus, number>({
    keyValidator: ((key) =>
        isLiteralUnion(patientStatusAllowedValues, key)) as (
        key: unknown
    ) => key is PatientStatus,
    valueValidator: ((value) => isNumber(value) && min(value, 0)) as (
        value: unknown
    ) => value is number,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsPatientCount<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<PatientCount, Each> {
    return makeValidator<PatientCount, Each>(
        'isPatientCount',
        (value: unknown, args?: ValidationArguments) => isPatientCount(value),
        validationOptions
    );
}
