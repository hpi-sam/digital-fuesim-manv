import { getCreate } from '../../models/utils/get-create';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class TreatmentsTimerEvent implements SimulationEvent {
    @IsValue('treatmentsTimerEvent')
    readonly type = 'treatmentsTimerEvent';

    static readonly create = getCreate(this);
}
