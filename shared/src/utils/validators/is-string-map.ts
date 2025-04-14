import { Transform, plainToInstance } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';
import { ValidateNested } from 'class-validator';
import type { Constructor } from '../constructor.js';
import { combineDecorators } from './combine-decorators.js';
import type { GenericPropertyDecorator } from './generic-property-decorator.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsStringMap<T extends object, Each extends boolean = false>(
    type: Constructor<T>,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key: string]: T }, Each> {
    return IsMultiTypedStringMap(
        () => type,
        () => true,
        validationOptions
    );
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsMultiTypedStringMap<
    T extends Constructor,
    Each extends boolean = false,
>(
    getConstructor: (value: InstanceType<T>) => T | undefined,
    keyValidator: (key: string, plain: InstanceType<T>) => boolean,
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<{ readonly [key: string]: InstanceType<T> }, Each> {
    const transform = Transform(
        ({ value }) => {
            const plainMap = value as { [key: string]: InstanceType<T> };
            if (
                Object.entries(plainMap).some(
                    ([key, plain]) => !keyValidator(key, plain)
                )
            ) {
                return 'invalid';
            }
            const plainWithConstructor = Object.values(plainMap).map(
                (entry) => [entry, getConstructor(entry)] as const
            );
            if (plainWithConstructor.some(([_, constr]) => !constr)) {
                return 'invalid';
            }
            const instances = plainWithConstructor.map(([entry, constr]) =>
                plainToInstance(constr!, entry)
            );
            return instances;
        },
        { toClassOnly: true }
    );
    const validateNested = ValidateNested({ ...validationOptions, each: true });
    return combineDecorators(transform, validateNested);
}
