import type { AllowedValues } from '../../utils/validators';

export type RelevantForHospitalTransportPatientCategory =
    | 'green'
    | 'red'
    | 'yellow';

export const relevantForHospitalTransportPatientCategoryAllowedValues: AllowedValues<RelevantForHospitalTransportPatientCategory> =
    {
        green: true,
        red: true,
        yellow: true,
    };
