import { IsUUID } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

export class PersonnelAvailableEvent implements SimulationEvent {
    @IsValue('personnelAvailableEvent')
    readonly type = 'personnelAvailableEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly personnelId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(personnelId: UUID) {
        this.personnelId = personnelId;
    }

    static readonly create = getCreate(this);
}
