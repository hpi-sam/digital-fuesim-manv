import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { ExerciseSimulationEvent, simulationEventTypeOptions } from '../events';
import { sendSimulationEvent } from '../utils/simulated-region';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class DelayEventActivityState implements SimulationActivityState {
    @IsValue('delayEventActivity' as const)
    public readonly type = 'delayEventActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    public readonly event!: ExerciseSimulationEvent;

    @IsInt()
    @Min(0)
    public readonly endTime!: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(id: UUID, event: ExerciseSimulationEvent, endTime: number) {
        this.id = id;
        this.event = event;
        this.endTime = endTime;
    }

    static readonly create = getCreate(this);
}

export const delayEventActivity: SimulationActivity<DelayEventActivityState> = {
    activityState: DelayEventActivityState,
    tick(draftState, simulatedRegion, activityState, _tickInterval, terminate) {
        if (draftState.currentTime >= activityState.endTime) {
            sendSimulationEvent(simulatedRegion, activityState.event);
            terminate();
        }
    },
};
