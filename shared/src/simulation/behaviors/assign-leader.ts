import { IsOptional, IsUUID } from 'class-validator';
import type { PersonnelType } from '../../models/utils';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import { getElement } from '../../store/action-reducers/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
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

const personnelPriorities: { [Key in PersonnelType]: number } = {
    notarzt: 0,
    san: 1,
    rettSan: 2,
    notSan: 3,
    gf: 4,
};

export const assignLeaderBehavior: SimulationBehavior<AssignLeaderBehaviorState> =
    {
        behaviorState: AssignLeaderBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            if (event.type === 'personnelAvailableEvent') {
                // If a gf (group leader of GW San) enters the region, we want to assign them as leader, since a gf can't treat patients
                // A gf has the highest priority, so they would be chosen by the logic for the tick event anyways
                // Therefore, this branch only serves the purpose to switch the leader
                if (!behaviorState.leaderId) {
                    return;
                }

                const currentLeader = getElement(
                    draftState,
                    'personnel',
                    behaviorState.leaderId
                );

                if (currentLeader.personnelType === 'gf') {
                    return;
                }

                const newPersonnel = getElement(
                    draftState,
                    'personnel',
                    event.personnelId
                );

                if (newPersonnel.personnelType === 'gf') {
                    behaviorState.leaderId = event.personnelId;
                }
            } else if (event.type === 'tickEvent' && !behaviorState.leaderId) {
                const personnel = Object.values(draftState.personnel).filter(
                    (pers) =>
                        isInSpecificSimulatedRegion(pers, simulatedRegion.id) &&
                        pers.personnelType !== 'notarzt'
                );

                if (personnel.length === 0) {
                    return;
                }

                personnel.sort(
                    (a, b) =>
                        personnelPriorities[b.personnelType] -
                        personnelPriorities[a.personnelType]
                );

                behaviorState.leaderId = personnel[0]?.id;
            }
        },
    };
