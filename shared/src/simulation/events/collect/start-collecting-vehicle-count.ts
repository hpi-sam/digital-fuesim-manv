import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingVehicleCountEvent implements SimulationEvent {
    @IsValue('startCollectingVehicleCountEvent')
    readonly type = 'startCollectingVehicleCountEvent';

    static readonly create = getCreate(this);
}
