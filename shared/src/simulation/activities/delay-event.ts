import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { sendSimulationEvent } from '../events/utils.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { ExerciseSimulationEvent } from '../events/exercise-simulation-event.js';
import { simulationEventTypeOptions } from '../events/exercise-simulation-event.js';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity.js';

export class DelayEventActivityState implements SimulationActivityState {
    @IsValue('delayEventActivity' as const)
    public readonly type = 'delayEventActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    public readonly event: ExerciseSimulationEvent;

    @IsInt()
    @Min(0)
    public readonly endTime: number;

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
