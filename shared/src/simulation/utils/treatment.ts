import type { AllowedValues } from '../../utils/validators';

export type TreatmentProgress = 'counted' | 'secured' | 'triaged' | 'unknown';

export const treatmentProgressAllowedValues: AllowedValues<TreatmentProgress> =
    {
        counted: true,
        secured: true,
        triaged: true,
        unknown: true,
    };
