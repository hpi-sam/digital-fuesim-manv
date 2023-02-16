import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class ReassignTreatmentsActivityState
    implements SimulationActivityState
{
    @IsValue('reassignTreatmentsActivity' as const)
    public readonly type = 'reassignTreatmentsActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id!: UUID;

    constructor(id: UUID) {
        this.id = id;
    }

    static readonly create = getCreate(this);
}

export const reassignTreatmentsActivity: SimulationActivity<ReassignTreatmentsActivityState> =
    {
        activityState: ReassignTreatmentsActivityState,
        tick(draftState, simulatedRegion, activityState, _, terminate) {
            // TODO: Add reassignment logic

            terminate();
        },
    };
