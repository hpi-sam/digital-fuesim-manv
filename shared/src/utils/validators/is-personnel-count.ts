import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { isNumber, min } from 'class-validator';
import type { PersonnelCount } from '../../models/radiogram/personnel-count-radiogram';
import type { PersonnelType } from '../../models/utils';
import { personnelTypeAllowedValues } from '../../models/utils';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { isLiteralUnion } from './is-literal-union';
import { makeValidator } from './make-validator';

export const isPersonnelCount = createMapValidator<PersonnelType, number>({
    keyValidator: ((key) =>
        isLiteralUnion(personnelTypeAllowedValues, key)) as (
        key: unknown
    ) => key is PersonnelType,
    valueValidator: ((value) => isNumber(value) && min(value, 0)) as (
        value: unknown
    ) => value is number,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsPersonnelCount<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<PersonnelCount, Each> {
    return makeValidator<PersonnelCount, Each>(
        'isPersonnelCount',
        (value: unknown, args?: ValidationArguments) => isPersonnelCount(value),
        validationOptions
    );
}
