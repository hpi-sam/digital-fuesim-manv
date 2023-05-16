import type { AllowedValues } from '../../../utils/validators';

/**
 * Defines the scope of the radiogram on the transfer progress.
 * * `singleRegion`: The information is only about the simulated region that sent the radiogram
 * * `transportManagement`: The information is about all simulated regions that are managed
 *   by the transport management behavior of the simulated region that sent the radiogram
 */
export type Scope = 'singleRegion' | 'transportManagement';

export const scopeAllowedValues: AllowedValues<Scope> = {
    singleRegion: true,
    transportManagement: true,
};
