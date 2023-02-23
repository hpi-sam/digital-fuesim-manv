import { IsOptional, IsUUID } from 'class-validator';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { personnelPriorities } from '../utils/priorities';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AssignLeaderBehaviorState implements SimulationBehaviorState {
    @IsValue('assignLeaderBehavior' as const)
    readonly type = 'assignLeaderBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly leaderId: UUID | undefined;

    static readonly create = getCreate(this);
}

export const assignLeaderBehavior: SimulationBehavior<AssignLeaderBehaviorState> =
    {
        behaviorState: AssignLeaderBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            if (behaviorState.leaderId) {
                return;
            }

            if (event.type === 'tickEvent') {
                const personnel = Object.values(draftState.personnel).filter(
                    (pers) =>
                        isInSpecificSimulatedRegion(pers, simulatedRegion.id) &&
                        pers.personnelType !== 'gf'
                );

                if (personnel.length === 0) {
                    return;
                }

                // TODO: Is this a good approach to select leadership personnel? (discuss with christian)
                personnel.sort(
                    (a, b) =>
                        personnelPriorities[b.personnelType] -
                        personnelPriorities[a.personnelType]
                );

                behaviorState.leaderId = personnel[0]?.id;
            }
        },
    };
