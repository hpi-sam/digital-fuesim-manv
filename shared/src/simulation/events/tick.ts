import { IsInt, IsPositive } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { getCreate } from '../../models/utils/get-create';
import type { SimulationEvent } from './simulation-event';

export class TickEvent implements SimulationEvent {
    @IsValue('tickEvent')
    readonly type = 'tickEvent';

    @IsInt()
    @IsPositive()
    public readonly tickInterval: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(tickInterval: number) {
        this.tickInterval = tickInterval;
    }

    static readonly create = getCreate(this);
}
