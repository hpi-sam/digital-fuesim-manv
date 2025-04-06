import { getCreate } from '../../models/utils/get-create.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { TreatmentProgress } from '../utils/treatment.js';
import { treatmentProgressAllowedValues } from '../utils/treatment.js';
import type { SimulationEvent } from './simulation-event.js';

export class TreatmentProgressChangedEvent implements SimulationEvent {
    @IsValue('treatmentProgressChangedEvent')
    readonly type = 'treatmentProgressChangedEvent';

    @IsLiteralUnion(treatmentProgressAllowedValues)
    readonly newProgress: TreatmentProgress;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(newProgress: TreatmentProgress) {
        this.newProgress = newProgress;
    }

    static readonly create = getCreate(this);
}
