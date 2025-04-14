import { getCreate } from '../../models/utils/get-create.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class SendRequestEvent implements SimulationEvent {
    @IsValue('sendRequestEvent')
    readonly type = 'sendRequestEvent';

    static readonly create = getCreate(this);
}
