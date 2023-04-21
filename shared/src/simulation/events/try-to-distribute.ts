import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

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
