import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { registerDecorator } from 'class-validator';

export function makeValidator(
    name: `is${string}`,
    validationFunction: (
        value: unknown,
        validationArguments?: ValidationArguments
    ) => boolean,
    validationOptions?: ValidationOptions
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
): (object: Object, propertyName: string) => void {
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
