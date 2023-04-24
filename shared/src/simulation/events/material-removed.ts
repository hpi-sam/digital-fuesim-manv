import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class MaterialRemovedEvent implements SimulationEvent {
    @IsValue('materialRemovedEvent')
    readonly type = 'materialRemovedEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly materialId!: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(materialId: UUID) {
        this.materialId = materialId;
    }

    static readonly create = getCreate(this);
}
