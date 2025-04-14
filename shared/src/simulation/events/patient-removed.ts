import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

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
