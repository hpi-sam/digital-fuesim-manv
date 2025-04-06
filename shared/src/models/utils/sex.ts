import type { AllowedValues } from '../../utils/validators/index.js';

export type Sex = 'diverse' | 'female' | 'male';

export const sexAllowedValues: AllowedValues<Sex> = {
    diverse: true,
    female: true,
    male: true,
};
