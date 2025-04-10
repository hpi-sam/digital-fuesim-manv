import { getCreate } from '../../models/utils/get-create.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class TreatmentsTimerEvent implements SimulationEvent {
    @IsValue('treatmentsTimerEvent')
    readonly type = 'treatmentsTimerEvent';

    static readonly create = getCreate(this);
}
