import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class MaterialRemovedEvent implements SimulationEvent {
    @IsValue('materialRemovedEvent')
    readonly type = 'materialRemovedEvent';

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
