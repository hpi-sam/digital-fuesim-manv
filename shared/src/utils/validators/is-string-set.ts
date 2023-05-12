import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { isString } from 'class-validator';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export const isStringSet = createMapValidator<string, true>({
    keyValidator: ((key) => isString(key)) as (key: unknown) => key is string,
    valueValidator: ((value) => value === true) as (
        value: unknown
    ) => value is true,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringSet<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ [key: string]: true }, Each> {
    return makeValidator<{ [key: string]: true }, Each>(
        'isStringSet',
        (value: unknown, args?: ValidationArguments) => isStringSet(value),
        validationOptions
    );
}
