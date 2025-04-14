import { IsInt, IsUUID, Min } from 'class-validator';
import type { UUID } from '../../../utils/index.js';
import { uuidValidationOptions } from '../../../utils/index.js';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../../utils/get-create.js';
import type { RadiogramStatus } from './radiogram-status.js';

export class RadiogramAcceptedStatus implements RadiogramStatus {
    @IsValue('acceptedRadiogramStatus')
    public readonly type = 'acceptedRadiogramStatus';

    @IsUUID(4, uuidValidationOptions)
    public readonly clientId: UUID;

    @IsInt()
    @Min(0)
    public readonly publishTime: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(clientId: UUID, publishTime: number) {
        this.clientId = clientId;
        this.publishTime = publishTime;
    }

    static readonly create = getCreate(this);
}
