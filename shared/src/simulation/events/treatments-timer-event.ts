import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class TreatmentsTimerEvent implements SimulationEvent {
    @IsValue('treatmentsTimerEvent')
    readonly type = 'treatmentsTimerEvent';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    static readonly create = getCreate(this);
}
