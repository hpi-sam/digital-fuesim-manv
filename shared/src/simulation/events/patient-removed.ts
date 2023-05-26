import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class PatientRemovedEvent implements SimulationEvent {
    @IsValue('patientRemovedEvent')
    readonly type = 'patientRemovedEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly patientId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(patientId: UUID) {
        this.patientId = patientId;
    }

    static readonly create = getCreate(this);
}
