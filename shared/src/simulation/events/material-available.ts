import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class MaterialAvailableEvent implements SimulationEvent {
    @IsValue('materialAvailableEvent')
    readonly type = 'materialAvailableEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly materialId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(materialId: UUID) {
        this.materialId = materialId;
    }

    static readonly create = getCreate(this);
}
