import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { getCreate } from '../../models/utils/get-create';
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
