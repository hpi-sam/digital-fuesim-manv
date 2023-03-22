import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingPatientCountEvent implements SimulationEvent {
    @IsValue('patientCountStartCollectingEvent')
    readonly type = 'patientCountStartCollectingEvent';

    static readonly create = getCreate(this);
}
