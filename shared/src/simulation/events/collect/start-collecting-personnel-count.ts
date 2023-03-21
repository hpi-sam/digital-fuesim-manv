import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingPersonnelCountEvent implements SimulationEvent {
    @IsValue('startCollectingPersonnelCountEvent')
    readonly type = 'startCollectingPersonnelCountEvent';

    static readonly create = getCreate(this);
}
