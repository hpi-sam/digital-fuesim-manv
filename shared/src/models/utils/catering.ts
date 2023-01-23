import type { PersonnelType } from './personnel-type';

/**
 * The count of assigned personnel and material that cater for a {@link Patient}.
 */
export type Catering = { [key in PersonnelType | 'material']: number };
