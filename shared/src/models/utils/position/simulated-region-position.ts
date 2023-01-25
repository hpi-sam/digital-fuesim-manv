import { IsUUID } from 'class-validator';
import { UUID } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isInSimulatedRegion,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNotInSimulatedRegion,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    simulatedRegionItsIn,
} from './meta-position-helpers';

export class SimulatedRegionPosition {
    /**
     * @deprecated Use {@link isInSimulatedRegion } or {@link isNotInSimulatedRegion} instead
     */
    @IsValue('simulatedRegion')
    public readonly type = 'simulatedRegion';

    /**
     * @deprecated Use {@link simulatedRegionItsIn } instead
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
