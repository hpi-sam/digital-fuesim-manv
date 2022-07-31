import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, isNumber, min, registerDecorator } from 'class-validator';

function isReachableTransferPoints(value: unknown): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.entries(value).every(
            ([key, thisValue]: [string, unknown]) =>
                isUUID(key, 4) &&
                typeof thisValue === 'object' &&
                thisValue !== null &&
                isNumber((thisValue as { duration: number }).duration) &&
                min((thisValue as { duration: number }).duration, 0)
        )
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsReachableTransferPoints(
    validationOptions?: ValidationOptions
) {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isReachableTransferPoints',
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    'Value must be a correct ReachableTransferPoints',
                ...validationOptions,
            },
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    return isReachableTransferPoints(value);
                },
            },
        });
    };
}
