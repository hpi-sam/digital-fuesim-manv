import { IsUUID } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import { UUID, uuidValidationOptions } from '../../../utils';
import type { Occupation } from './occupation';

export class LoadOccupation implements Occupation {
    @IsValue('loadOccupation')
    readonly type = 'loadOccupation';

    @IsUUID(4, uuidValidationOptions)
    readonly loadingActivityId: UUID;

    constructor(loadingActivityId: UUID) {
        this.loadingActivityId = loadingActivityId;
    }

    static readonly create = getCreate(this);
}
