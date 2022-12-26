import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';

export function makeValidator<T>(
    name: `is${string}`,
    validationFunction: (
        value: unknown,
        validationArguments?: ValidationArguments
    ) => boolean,
    validationOptions?: ValidationOptions
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
): GenericPropertyDecorator<T> {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name,
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    `Value must be a correct ${name.slice(2)}`,
                ...validationOptions,
            },
            validator: {
                validate: validationFunction,
            },
        });
    };
}
