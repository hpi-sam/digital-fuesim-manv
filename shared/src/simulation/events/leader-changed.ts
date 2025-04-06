import { IsUUID, ValidateIf } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

export class LeaderChangedEvent implements SimulationEvent {
    @IsValue('leaderChangedEvent')
    readonly type = 'leaderChangedEvent';

    @ValidateIf((_, value) => value !== null)
    @IsUUID(4, uuidValidationOptions)
    readonly oldLeaderId: UUID | null;

    @ValidateIf((_, value) => value !== null)
    @IsUUID(4, uuidValidationOptions)
    readonly newLeaderId: UUID | null;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(oldLeaderId: UUID | null, newLeaderId: UUID | null) {
        this.oldLeaderId = oldLeaderId;
        this.newLeaderId = newLeaderId;
    }

    static readonly create = getCreate(this);
}
