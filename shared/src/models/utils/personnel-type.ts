export type PersonnelType = 'gf' | 'notarzt' | 'notSan' | 'rettSan' | 'san';
export const personnelTypeNames: {
    [key in PersonnelType]: string;
} = {
    gf: 'Gruppenführer',
    notarzt: 'Notarzt',
    notSan: 'Notfallsanitäter',
    rettSan: 'Rettungssanitäter',
    san: 'Sanitäter',
};
