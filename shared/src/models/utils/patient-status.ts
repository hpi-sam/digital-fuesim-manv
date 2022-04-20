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
