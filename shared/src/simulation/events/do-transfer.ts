import { getCreate } from '../../models/utils/get-create.js';
import { IsValue } from '../../utils/validators/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class DoTransferEvent implements SimulationEvent {
    @IsValue('doTransferEvent')
    readonly type = 'doTransferEvent';

    static readonly create = getCreate(this);
}
