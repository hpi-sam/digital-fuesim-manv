import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingVehicleCountEvent implements SimulationEvent {
    @IsValue('vehicleCountStartCollectingEvent')
    readonly type = 'vehicleCountStartCollectingEvent';

    static readonly create = getCreate(this);
}
