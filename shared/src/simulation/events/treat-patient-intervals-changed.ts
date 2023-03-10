import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsValue } from '../../utils/validators';
import { TreatPatientsIntervals } from '../utils/treat-patients-intervals';
import type { SimulationEvent } from './simulation-event';

export class TreatPatientIntervalsChangedEvent implements SimulationEvent {
    @IsValue('treatPatientIntervalsChangedEvent')
    readonly type = 'treatPatientIntervalsChangedEvent';

    @Type(() => TreatPatientsIntervals)
    @ValidateNested()
    readonly newTreatPatientsIntervals: TreatPatientsIntervals;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(newTreatPatientsIntervals: TreatPatientsIntervals) {
        this.newTreatPatientsIntervals = newTreatPatientsIntervals;
    }

    static readonly create = getCreate(this);
}
