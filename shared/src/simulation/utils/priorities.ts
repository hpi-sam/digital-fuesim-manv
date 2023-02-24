import type { PersonnelType } from '../../models/utils';

export const personnelPriorities: { [Key in PersonnelType]: number } = {
    gf: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    notarzt: 4,
};
