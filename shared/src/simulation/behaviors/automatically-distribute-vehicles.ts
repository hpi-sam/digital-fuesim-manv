import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuid } from '../../utils';
import { IsValue } from '../../utils/validators';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AutomaticallyDistributeVehiclesBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('automaticallyDistributeVehiclesBehavior')
    readonly type = 'automaticallyDistributeVehiclesBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    static readonly create = getCreate(this);
}

export const automaticallyDistributeVehiclesBehavior: SimulationBehavior<AutomaticallyDistributeVehiclesBehaviorState> =
    {
        behaviorState: AutomaticallyDistributeVehiclesBehaviorState,
        handleEvent: (_draftState, _simulatedRegion, _behaviorState, event) => {
            switch (event.type) {
                case 'tickEvent': {
                    break;
                }
                default:
                // Ignore event
            }
        },
    };
