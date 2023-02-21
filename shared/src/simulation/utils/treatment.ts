export type TreatmentProgress = 'counted' | 'secured' | 'triaged' | 'unknown';

export const treatmentProgressAllowedValues: {
    [Key in TreatmentProgress]: true;
} = {
    counted: true,
    secured: true,
    triaged: true,
    unknown: true,
};
