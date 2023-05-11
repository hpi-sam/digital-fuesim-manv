import type { AllowedValues } from '../../../utils/validators';

export type Scope = 'singleRegion' | 'transportManagement';

export const scopeAllowedValues: AllowedValues<Scope> = {
    singleRegion: true,
    transportManagement: true,
};
