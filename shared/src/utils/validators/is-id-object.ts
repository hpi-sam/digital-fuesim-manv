import { plainToInstance } from 'class-transformer';
import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, validateSync, registerDecorator } from 'class-validator';
import type { Constructor } from '../constructor';
import type { UUID } from '../uuid';

function isIdObject<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID,
    value: unknown
): boolean {
    return (
        typeof value === 'object' &&
        value !== null &&
        Object.entries(value).every(([key, thisValue]) => {
            if (!isUUID(key, 4)) {
                return false;
            }
            const converted = plainToInstance(type, thisValue);
            const validationResult = validateSync(converted);
            if (validationResult.length > 0) {
                return false;
            }
            if (getId(converted) !== key) {
                return false;
            }
            return true;
        })
    );
}

/**
 * An `IdObject` is of type `{ [key: UUID]: T }`
 *
 * @property getId A function to get the id that is used as the key in the object. Defaults to `.id`, this might be wrong for some types, though.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsIdObject<T extends object>(
    type: Constructor<T>,
    getId: (value: T) => UUID = (value) => (value as { id: UUID }).id,
    validationOptions?: ValidationOptions
) {
    // Disabled as this is the suggested way for [class-validator](https://github.com/typestack/class-validator#custom-validation-decorators)
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isIdObject',
            target: object.constructor,
            propertyName,
            options: {
                message:
                    validationOptions?.message ??
                    'Value must be a correct IdObject',
                ...validationOptions,
            },
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    return isIdObject(type, getId, value);
                },
            },
        });
    };
}
