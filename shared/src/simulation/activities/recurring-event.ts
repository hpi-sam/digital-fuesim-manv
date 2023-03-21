import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
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

    @IsBoolean()
    public readonly enabled: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        event: ExerciseSimulationEvent,
        firstOccurrenceTime: number,
        recurrenceIntervalTime: number,
        enabled: boolean
    ) {
        this.id = id;
        this.event = event;
        this.nextOccurrenceTime = firstOccurrenceTime;
        this.recurrenceIntervalTime = recurrenceIntervalTime;
        this.enabled = enabled;
    }

    static readonly create = getCreate(this);
}

export const recurringEventActivity: SimulationActivity<RecurringEventActivityState> =
    {
        activityState: RecurringEventActivityState,
        tick(draftState, simulatedRegion, activityState) {
            if (draftState.currentTime >= activityState.nextOccurrenceTime) {
                activityState.nextOccurrenceTime +=
                    activityState.recurrenceIntervalTime;
                if (activityState.enabled) {
                    sendSimulationEvent(simulatedRegion, activityState.event);
                }
            }
        },
    };
