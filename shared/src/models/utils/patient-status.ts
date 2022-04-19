export type PatientStatus =
    | 'black'
    | 'blue'
    | 'green'
    | 'red'
    | 'white'
    | 'yellow';

export function getStatusName(status: PatientStatus): string {
    switch (status) {
        case 'black':
            return 'ex';
        case 'blue':
            return 'SK IV';
        case 'green':
            return 'SK III';
        case 'red':
            return 'SK I';
        case 'white':
            return 'Ungesichtet';
        case 'yellow':
            return 'SK II';
    }
}
