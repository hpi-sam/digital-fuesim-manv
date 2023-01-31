import { IsUUID } from 'class-validator';
import { UUID } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import {
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isInSimulatedRegion,
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNotInSimulatedRegion,
    // import needed to display @link Links in Comments
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentSimulatedRegionIdOf,
} from './position-helpers';

export class SimulatedRegionPosition {
    /**
     * @deprecated Use {@link isInSimulatedRegion } or {@link isNotInSimulatedRegion} instead
     */
    @IsValue('simulatedRegion')
    public readonly type = 'simulatedRegion';

    /**
     * @deprecated Use {@link currentSimulatedRegionIdOf } instead
     */
    @IsUUID()
    public readonly simulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(simulatedRegionId: UUID) {
        this.simulatedRegionId = simulatedRegionId;
    }

    static readonly create = getCreate(this);
}
