import type { AllowedValues } from '../../utils/validators';

export type MaterialType = 'big' | 'standard';

export const materialTypeAllowedValues: AllowedValues<MaterialType> = {
    big: true,
    standard: true,
};
