import type { AllowedValues } from '../../utils/validators/index.js';

export type PatientStatus =
    | 'black'
    | 'blue'
    | 'green'
    | 'red'
    | 'white'
    | 'yellow';

export const statusNames: {
    [key in PatientStatus]: string;
} = {
    black: 'ex',
    blue: 'SK IV',
    green: 'SK III',
    red: 'SK I',
    white: 'Ungesichtet',
    yellow: 'SK II',
};

export const patientStatusAllowedValues: AllowedValues<PatientStatus> = {
    black: true,
    blue: true,
    green: true,
    red: true,
    white: true,
    yellow: true,
};

export type PatientStatusForTransport = 'green' | 'red' | 'yellow';

export const patientStatusForTransportAllowedValues: AllowedValues<PatientStatusForTransport> =
    {
        green: true,
        red: true,
        yellow: true,
    };
