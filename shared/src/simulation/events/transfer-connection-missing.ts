import { IsOptional, IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class TransferConnectionMissingEvent implements SimulationEvent {
    @IsValue('transferConnectionMissingEvent')
    readonly type = 'transferConnectionMissingEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId: UUID;

    @IsOptional()
    @IsString()
    public readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(transferPointId: UUID, key?: string) {
        this.transferPointId = transferPointId;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
