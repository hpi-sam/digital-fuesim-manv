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

export const treatmentProgressToGermanNameDictionary: {
    [Key in TreatmentProgress]: string;
} = {
    counted: 'Vorsichten',
    noTreatment: 'Keine Behandlung',
    secured: 'Erstversorgung sichergestellt',
    triaged: 'Behandeln, Personal fehlt',
    unknown: 'Erkunden',
};
