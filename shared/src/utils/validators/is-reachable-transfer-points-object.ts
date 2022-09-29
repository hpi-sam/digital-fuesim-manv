import type { ValidationOptions, ValidationArguments } from 'class-validator';
import { isUUID, isNumber, min } from 'class-validator';
import type { ReachableTransferPoints } from '../../models/transfer-point';
import type { UUID } from '../uuid';
import { createMapValidator } from './create-map-validator';
import { makeValidator } from './make-validator';

export const isReachableTransferPoints = createMapValidator<
    UUID,
    ReachableTransferPoints
>({
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    keyValidator: <(key: unknown) => key is UUID>((key) => isUUID(key, 4)),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    valueValidator: <(value: unknown) => value is ReachableTransferPoints>(
        ((value) =>
            typeof value === 'object' &&
            value !== null &&
            isNumber((value as { duration: number }).duration) &&
            min((value as { duration: number }).duration, 0))
    ),
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export function IsReachableTransferPoints(
    validationOptions?: ValidationOptions
) {
    return makeValidator(
        'isReachableTransferPoints',
        (value: unknown, args?: ValidationArguments) =>
            isReachableTransferPoints(value),
        validationOptions
    );
}
