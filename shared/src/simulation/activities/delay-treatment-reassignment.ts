import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { terminateActivity } from '../utils/simulated-region';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';
import { reassignTreatments } from './utils/reassign-treatments';

export class DelayTreatmentReassignmentActivityState
    implements SimulationActivityState
{
    @IsValue('delayTreatmentReassignmentActivity' as const)
    public readonly type = 'delayTreatmentReassignmentActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    /**
     * The time at which the delayed reassignment should occur.
     */
    @IsInt()
    @Min(0)
    public readonly endTime!: number;

    constructor(endTime: number) {
        this.endTime = endTime;
    }

    static readonly create = getCreate(this);
}

export const delayTreatmentReassignmentActivity: SimulationActivity<DelayTreatmentReassignmentActivityState> =
    {
        activityState: DelayTreatmentReassignmentActivityState,
        tick(draftState, simulatedRegion, activityState, tickInterval) {
            if (draftState.currentTime >= activityState.endTime) {
                reassignTreatments(draftState, simulatedRegion);

                terminateActivity(
                    draftState,
                    simulatedRegion,
                    activityState.id
                );
            }
        },
    };
