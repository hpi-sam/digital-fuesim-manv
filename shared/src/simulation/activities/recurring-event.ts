import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { ExerciseSimulationEvent, simulationEventTypeOptions } from '../events';
import { sendSimulationEvent } from '../events/utils';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

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
    public readonly nextOccurrenceTime: number;

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
        this.nextOccurrenceTime = firstOccurrenceTime;
        this.recurrenceIntervalTime = recurrenceIntervalTime;
    }

    static readonly create = getCreate(this);
}

export const recurringEventActivity: SimulationActivity<RecurringEventActivityState> =
    {
        activityState: RecurringEventActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            if (draftState.currentTime >= activityState.nextOccurrenceTime) {
                activityState.nextOccurrenceTime +=
                    activityState.recurrenceIntervalTime;
                sendSimulationEvent(simulatedRegion, activityState.event);
                terminate();
            }
        },
    };
