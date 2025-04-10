import type { AllowedValues } from '../../utils/validators/index.js';

export type TransferDestination = 'hospital' | 'transferPoint';

export const transferDestinationTypeAllowedValues: AllowedValues<TransferDestination> =
    {
        hospital: true,
        transferPoint: true,
    };
