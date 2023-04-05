import { IsString } from 'class-validator';
import { getCreate } from '../../models/utils/get-create';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class SendRequestEvent implements SimulationEvent {
    @IsValue('sendRequestEvent')
    readonly type = 'sendRequestEvent';

    static readonly create = getCreate(this);
}
