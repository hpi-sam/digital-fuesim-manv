import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, registerDecorator } from 'class-validator';

function isUUIDSet(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.keys(value).every((key) => isUUID(key, 4)) &&
        Object.values(value).every((thisValue) => thisValue === true)
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsUUIDSet(validationOptions?: ValidationOptions) {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isUUIDSet',
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    'Value must be a correct UUIDSet',
                ...validationOptions,
            },
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    return isUUIDSet(value);
                },
            },
        });
    };
}
