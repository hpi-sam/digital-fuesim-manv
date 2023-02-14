import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { terminateActivity } from '../utils/simulated-region';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';
import { reassignTreatments } from './utils/reassign-treatments';

export class ReassignTreatmentsActivityState
    implements SimulationActivityState
{
    @IsValue('reassignTreatmentsActivity' as const)
    public readonly type = 'reassignTreatmentsActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    static readonly create = getCreate(this);
}

export const reassignTreatmentsActivity: SimulationActivity<ReassignTreatmentsActivityState> =
    {
        activityState: ReassignTreatmentsActivityState,
        tick(draftState, simulatedRegion, activityState, tickInterval) {
            reassignTreatments(draftState, simulatedRegion);

            terminateActivity(draftState, simulatedRegion, activityState.id);
        },
    };
