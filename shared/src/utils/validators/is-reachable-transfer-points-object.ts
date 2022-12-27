import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, isNumber, min } from 'class-validator';
import type { ReachableTransferPoints } from '../../models/transfer-point';
import type { UUID } from '../uuid';
import { createMapValidator } from './create-map-validator';
import type { GenericPropertyDecorator } from './generic-property-decorator';
import { makeValidator } from './make-validator';

export const isReachableTransferPoints = createMapValidator<
    UUID,
    ReachableTransferPoints
>({
    keyValidator: ((key) => isUUID(key, 4)) as (key: unknown) => key is UUID,
    valueValidator: ((value) =>
        typeof value === 'object' &&
        value !== null &&
        isNumber((value as { duration: number }).duration) &&
        min((value as { duration: number }).duration, 0)) as (
        value: unknown
    ) => value is ReachableTransferPoints,
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsReachableTransferPoints<Each extends boolean = false>(
    validationOptions?: ValidationOptions & { each?: Each }
): GenericPropertyDecorator<ReachableTransferPoints, Each> {
    return makeValidator<ReachableTransferPoints, Each>(
        'isReachableTransferPoints',
        (value: unknown, args?: ValidationArguments) =>
            isReachableTransferPoints(value),
        validationOptions
    );
}
