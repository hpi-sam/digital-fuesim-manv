import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingTreatmentStatusEvent implements SimulationEvent {
    @IsValue('treatmentStatusStartCollectingEvent')
    readonly type = 'treatmentStatusStartCollectingEvent';

    static readonly create = getCreate(this);
}
