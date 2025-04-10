import { IsUUID } from 'class-validator';
import type { UUID } from '../../../utils/index.js';
import { uuidValidationOptions } from '../../../utils/index.js';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
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
} from './position-helpers.js';

export class SimulatedRegionPosition {
    /**
     * @deprecated Use {@link isInSimulatedRegion } or {@link isNotInSimulatedRegion} instead
     */
    @IsValue('simulatedRegion')
    public readonly type = 'simulatedRegion';

    /**
     * @deprecated Use {@link currentSimulatedRegionIdOf } instead
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(simulatedRegionId: UUID) {
        this.simulatedRegionId = simulatedRegionId;
    }

    static readonly create = getCreate(this);
}
