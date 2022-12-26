import type { ValidationOptions, ValidationArguments } from 'class-validator';
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
export type AllowedValues<T extends string> = { [key in T]: true };

export function isStringLiteralUnion<T extends string>(
    allowedValues: AllowedValues<T>,
    valueToBeValidated: unknown
): boolean {
    return (
        typeof valueToBeValidated === 'string' &&
        allowedValues[valueToBeValidated as T]
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringLiteralUnion<
    T extends string,
    Each extends boolean = false
>(
    allowedValues: AllowedValues<T>,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<T, Each> {
    return makeValidator<T, Each>(
        'isStringLiteralUnion',
        (value: unknown, args?: ValidationArguments) =>
            isStringLiteralUnion<T>(allowedValues, value),
        validationOptions
    );
}
