import type { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { getCreate } from './get-create';

export class SimulatedRegionPosition {
    @IsValue('simulatedRegion')
    public readonly type = 'simulatedRegion';

    public readonly simulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(simulatedRegionId: UUID) {
        this.simulatedRegionId = simulatedRegionId;
    }

    static readonly create = getCreate(this);
}
