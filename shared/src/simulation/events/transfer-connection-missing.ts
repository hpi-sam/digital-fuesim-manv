import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class TransferConnectionMissingEvent implements SimulationEvent {
    @IsValue('transferConnectionMissingEvent')
    readonly type = 'transferConnectionMissingEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly transferPointId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(id: UUID, transferPointId: UUID) {
        this.id = id;
        this.transferPointId = transferPointId;
    }

    static readonly create = getCreate(this);
}
