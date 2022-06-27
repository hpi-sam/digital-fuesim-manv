// TODO: Personnel settings (imageBlobId, name, type, capacity)
export type PersonnelType = 'gf' | 'notarzt' | 'notSan' | 'rettSan' | 'san';

// Names copied from the names previously used at frontend/src/app/pages/exercises/exercise/shared/exercise-statistics/exercise-statistics-modal/exercise-statistics-modal.component.ts
export const personnelTypeNames: { [type in PersonnelType]: string } = {
    gf: 'GF',
    notarzt: 'Notarzt',
    notSan: 'NotSan',
    rettSan: 'RettSan',
    san: 'San',
};
