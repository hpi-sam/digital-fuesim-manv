import type { SimulatedRegion } from '../../models';
import type { WithPosition } from '../../models/utils';
import {
    currentSimulatedRegionIdOf,
    isInSimulatedRegion,
} from '../../models/utils';

export function isInThisSimulatedRegion(
    region: SimulatedRegion,
    withPosition: WithPosition
): boolean {
    return (
        isInSimulatedRegion(withPosition) &&
        currentSimulatedRegionIdOf(withPosition) === region.id
    );
}
