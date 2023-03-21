import { getCreate } from '../../../models/utils';
import { IsValue } from '../../../utils/validators';
import type { SimulationEvent } from '../simulation-event';

export class StartCollectingMaterialCountEvent implements SimulationEvent {
    @IsValue('startCollectingMaterialCountEvent')
    readonly type = 'startCollectingMaterialCountEvent';

    static readonly create = getCreate(this);
}
