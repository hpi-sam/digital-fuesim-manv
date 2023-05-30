import { getCreate } from '../../models/utils/get-create';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../utils/treatment';
import type { SimulationEvent } from './simulation-event';

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
