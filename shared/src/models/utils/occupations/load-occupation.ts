import { IsUUID } from 'class-validator';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { UUID } from '../../../utils/index.js';
import { uuidValidationOptions } from '../../../utils/index.js';
import type { Occupation } from './occupation.js';

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
