import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { ExerciseSimulationEvent } from '../events/exercise-simulation-event.js';
import { simulationEventTypeOptions } from '../events/exercise-simulation-event.js';
import { sendSimulationEvent } from '../events/utils.js';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity.js';

export class RecurringEventActivityState implements SimulationActivityState {
    @IsValue('recurringEventActivity' as const)
    public readonly type = 'recurringEventActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    public readonly event: ExerciseSimulationEvent;

    @IsInt()
    @Min(0)
    public readonly lastOccurrenceTime: number;

    @Min(0)
    public readonly recurrenceIntervalTime: number;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        event: ExerciseSimulationEvent,
        firstOccurrenceTime: number,
        recurrenceIntervalTime: number
    ) {
        this.id = id;
        this.event = event;
        this.lastOccurrenceTime = firstOccurrenceTime - recurrenceIntervalTime;
        this.recurrenceIntervalTime = recurrenceIntervalTime;
    }

    static readonly create = getCreate(this);
}

export const recurringEventActivity: SimulationActivity<RecurringEventActivityState> =
    {
        activityState: RecurringEventActivityState,
        tick(draftState, simulatedRegion, activityState) {
            if (
                draftState.currentTime >=
                activityState.lastOccurrenceTime +
                    activityState.recurrenceIntervalTime
            ) {
                activityState.lastOccurrenceTime = draftState.currentTime;
                sendSimulationEvent(simulatedRegion, activityState.event);
            }
        },
    };
