import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isIn } from 'class-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

/**
 * A type for validating unions of string literals.
 *
 * @example
 * ````ts
 * type StringLiteralUnion = 'a' | 'b';
 *
 * const stringLiteralUnionAllowedValues: AllowedValues<StringLiteralUnion> = {
 *     a: true,
 *     b: true,
 * };
 *
 * class MyClassToValidate {
 *     @IsStringLiteralUnion<StringLiteralUnion>(stringLiteralUnionAllowedValues)
 *     public readonly myString: StringLiteralUnion;
 * }
 *
 * ````
 */
export type AllowedValues<T extends number | string | symbol> = {
    [key in T]: true;
};

export function isLiteralUnion<T extends number | string | symbol>(
    allowedValues: AllowedValues<T>,
    valueToBeValidated: unknown
): boolean {
    return isIn(valueToBeValidated, Object.keys(allowedValues));
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsLiteralUnion<
    T extends number | string | symbol,
    Each extends boolean = false
>(
    allowedValues: AllowedValues<T>,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<T, Each> {
    return makeValidator<T, Each>(
        'isLiteralUnion',
        (value: unknown, args?: ValidationArguments) =>
            isLiteralUnion<T>(allowedValues, value),
        validationOptions
    );
}
