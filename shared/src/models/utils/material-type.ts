import type { AllowedValues } from '../../utils/validators/index.js';

export type MaterialType = 'big' | 'standard';

export const materialTypeAllowedValues: AllowedValues<MaterialType> = {
    big: true,
    standard: true,
};
