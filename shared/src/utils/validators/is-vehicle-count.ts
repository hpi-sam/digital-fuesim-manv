import type { ValidationArguments, ValidationOptions } from 'class-validator';
import { isNumber, isString, min } from 'class-validator';
import type { VehicleCount } from '../../models/radiogram/vehicle-count-radiogram.js';
import { createMapValidator } from './create-map-validator.js';
import type { GenericPropertyDecorator } from './generic-property-decorator.js';
import { makeValidator } from './make-validator.js';

export const isVehicleCount = createMapValidator<string, number>({
    keyValidator: isString,
    valueValidator: ((value) => isNumber(value) && min(value, 0)) as (
        value: unknown
    ) => value is number,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsVehicleCount<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<VehicleCount, Each> {
    return makeValidator<VehicleCount, Each>(
        'isVehicleCount',
        (value: unknown, args?: ValidationArguments) => isVehicleCount(value),
        validationOptions
    );
}
