import type { AllowedValues } from '../../utils/validators';

export type TransferDestination = 'hospital' | 'transferPoint';

export const transferDestinationTypeAllowedValues: AllowedValues<TransferDestination> =
    {
        hospital: true,
        transferPoint: true,
    };
