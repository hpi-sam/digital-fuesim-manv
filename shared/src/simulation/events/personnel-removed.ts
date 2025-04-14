import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class PersonnelRemovedEvent implements SimulationEvent {
    @IsValue('personnelRemovedEvent')
    readonly type = 'personnelRemovedEvent';

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
