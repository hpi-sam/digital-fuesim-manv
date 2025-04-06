import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { min, isString, isInt } from 'class-validator';
import type { ResourceDescription } from '../../models/utils/resource-description.js';
import { createMapValidator } from './create-map-validator.js';
import type { GenericPropertyDecorator } from './generic-property-decorator.js';
import { makeValidator } from './make-validator.js';
import type { AllowedValues } from './is-literal-union.js';
import { isLiteralUnion } from './is-literal-union.js';

export function isResourceDescription<Key extends string>(
    keyAllowedValues?: AllowedValues<Key>,
    valueToBeValidated?: unknown
): valueToBeValidated is ResourceDescription<Key> {
    return createMapValidator<Key, number>({
        keyValidator: (keyAllowedValues
            ? (value: unknown) => isLiteralUnion(keyAllowedValues, value)
            : isString) as (value: unknown) => value is Key,
        valueValidator: (value): value is number =>
            isInt(value) && min(value, 0),
    })(valueToBeValidated);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsResourceDescription<
    Key extends string,
    Each extends boolean = false,
>(
    keyAllowedValues?: AllowedValues<Key>,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<ResourceDescription<Key>, Each> {
    return makeValidator<ResourceDescription<Key>, Each>(
        'isResourceDescription',
        (value: unknown, args?: ValidationArguments) =>
            isResourceDescription(keyAllowedValues, value),
        validationOptions
    );
}
