import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../../utils';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import type { Occupation } from './occupation';

export class IsLeaderOccupation implements Occupation {
    @IsValue('isLeaderOccupation')
    readonly type = 'isLeaderOccupation';

    @IsUUID(4, uuidValidationOptions)
    readonly simulatedRegionId: UUID;

    /**
     * @deprecated Use static `create` method instead.
     */
    constructor(simulatedRegionId: UUID) {
        this.simulatedRegionId = simulatedRegionId;
    }

    static readonly create = getCreate(this);
}
