import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isIn } from 'class-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export function isValue<T>(
    expectedValue: T,
    valueToBeValidated: unknown
): boolean {
    return isIn(valueToBeValidated, [expectedValue]);
}

// With TS 5.0 use `const T` (https://github.com/microsoft/TypeScript/pull/51865)
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsValue<T, Each extends boolean = false>(
    expectedValue: T,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<T, Each> {
    return makeValidator<T, Each>(
        'isValue',
        (value: unknown, args?: ValidationArguments) =>
            isValue<T>(expectedValue, value),
        validationOptions
    );
}
