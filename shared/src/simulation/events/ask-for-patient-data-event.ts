import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class AskForPatientDataEvent implements SimulationEvent {
    @IsValue('askForPatientDataEvent')
    readonly type = 'askForPatientDataEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(behaviorId: UUID) {
        this.behaviorId = behaviorId;
    }

    static readonly create = getCreate(this);
}
