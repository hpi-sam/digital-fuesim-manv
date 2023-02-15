import { IsInt, IsPositive } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class TickEvent implements SimulationEvent {
    @IsValue('tickEvent')
    readonly type = 'tickEvent';

    @IsInt()
    @IsPositive()
    public readonly tickInterval!: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(tickInterval: number) {
        this.tickInterval = tickInterval;
    }

    static readonly create = getCreate(this);
}
