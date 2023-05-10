import type { AllowedValues } from '../../utils/validators';

export type AlivePatientTriageCategory = 'green' | 'red' | 'yellow';

export const alivePatientTriageCategoryAllowedValues: AllowedValues<AlivePatientTriageCategory> =
    {
        green: true,
        red: true,
        yellow: true,
    };
