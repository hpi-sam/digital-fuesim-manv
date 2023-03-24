import type { AllowedValues } from '../../utils/validators';

export type TreatmentProgress =
    | 'counted'
    | 'noTreatment'
    | 'secured'
    | 'triaged'
    | 'unknown';

export const treatmentProgressAllowedValues: AllowedValues<TreatmentProgress> =
    {
        counted: true,
        noTreatment: true,
        secured: true,
        triaged: true,
        unknown: true,
    };
