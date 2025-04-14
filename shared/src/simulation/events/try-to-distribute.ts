import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class TryToDistributeEvent implements SimulationEvent {
    @IsValue('tryToDistributeEvent')
    readonly type = 'tryToDistributeEvent';

    @IsUUID()
    public readonly behaviorId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(behaviorId: UUID) {
        this.behaviorId = behaviorId;
    }

    static readonly create = getCreate(this);
}
