import type { AllowedValues } from '../../utils/validators';

export type PersonnelType = 'gf' | 'notarzt' | 'notSan' | 'rettSan' | 'san';

export const personnelTypeAllowedValues: AllowedValues<PersonnelType> = {
    gf: true,
    notarzt: true,
    notSan: true,
    rettSan: true,
    san: true,
};

export const personnelTypeNames: {
    [key in PersonnelType]: string;
} = {
    gf: 'Gruppenführer',
    notarzt: 'Notarzt',
    notSan: 'Notfallsanitäter',
    rettSan: 'Rettungssanitäter',
    san: 'Sanitäter',
};
