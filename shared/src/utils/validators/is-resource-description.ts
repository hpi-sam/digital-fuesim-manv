import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { min, isString, isInt } from 'class-validator';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export const isResourceDescription = createMapValidator<string, number>({
    keyValidator: isString,
    valueValidator: (value): value is number => isInt(value) && min(value, 0),
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsResourceDescription<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ [key: string]: number }, Each> {
    return makeValidator<{ [key: string]: number }, Each>(
        'isResourceDescription',
        (value: unknown, args?: ValidationArguments) =>
            isResourceDescription(value),
        validationOptions
    );
}
