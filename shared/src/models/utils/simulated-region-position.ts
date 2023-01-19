import type { UUID } from '../../utils';
import { getCreate } from './get-create';

export class SimulatedRegionPosition {
    public readonly type: 'SimulatedRegion';

    public readonly simulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(simulatedRegionId: UUID) {
        this.type = 'SimulatedRegion';
        this.simulatedRegionId = simulatedRegionId;
    }

    static readonly create = getCreate(this);
}
