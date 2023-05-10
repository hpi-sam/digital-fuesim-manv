import { IsOptional, IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

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
