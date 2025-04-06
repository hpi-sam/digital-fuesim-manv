import { IsUUID } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

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
