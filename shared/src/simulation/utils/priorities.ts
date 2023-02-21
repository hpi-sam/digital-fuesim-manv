import type { PatientStatus, PersonnelType } from '../../models/utils';

export const personnelPriorities: { [Key in PersonnelType]: number } = {
    gf: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    notarzt: 4,
};

export const patientPriorities: { [Key in PatientStatus]: number } = {
    black: 0,
    blue: 1,
    green: 2,
    yellow: 3,
    red: 4,
    white: 5,
};
