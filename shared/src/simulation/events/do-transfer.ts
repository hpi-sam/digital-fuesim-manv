import { getCreate } from '../../models/utils/get-create';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class DoTransferEvent implements SimulationEvent {
    @IsValue('doTransferEvent')
    readonly type = 'doTransferEvent';

    static readonly create = getCreate(this);
}
