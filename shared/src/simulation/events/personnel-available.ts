import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

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
