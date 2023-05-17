import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { min, isString, isInt } from 'class-validator';
import type { ResourceDescription } from '../../models/utils/resource-description';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';
import type { AllowedValues } from './is-literal-union';
import { isLiteralUnion } from './is-literal-union';

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
    Each extends boolean = false
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
