import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { registerDecorator } from 'class-validator';

function isLiteralType<T extends string>(
    values: { [key in T]: true },
    value: unknown
): boolean {
    return typeof value === 'string' && Object.keys(values).includes(value);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsLiteralType<T extends string>(
    values: { [key in T]: true },
    validationOptions?: ValidationOptions
) {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isLiteralType',
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    'Value must be a correct LiteralType',
                ...validationOptions,
            },
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    return isLiteralType(values, value);
                },
            },
        });
    };
}
