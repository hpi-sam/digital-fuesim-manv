import { IsUUID } from 'class-validator';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import { getElementByPredicate } from '../../store/action-reducers/utils';
import { UUID, uuid } from '../../utils';
import { IsValue } from '../../utils/validators';
import { TransferVehiclesActivityState } from '../activities';
import { addActivity } from '../activities/utils';
import type { ResourceRequiredEvent } from '../events';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AnswerRequestsBehaviorState implements SimulationBehaviorState {
    @IsValue('answerRequestsBehavior')
    readonly type = 'answerRequestsBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    static readonly create = getCreate(this);
}

export const answerRequestsBehavior: SimulationBehavior<AnswerRequestsBehaviorState> =
    {
        behaviorState: AnswerRequestsBehaviorState,
        handleEvent: (draftState, simulatedRegion, _behaviorState, event) => {
            switch (event.type) {
                case 'resourceRequiredEvent': {
                    const resourceRequiredEvent =
                        event as ResourceRequiredEvent;

                    if (
                        resourceRequiredEvent.requiringSimulatedRegionId !==
                        simulatedRegion.id
                    ) {
                        const requiringSimulatedRegionTransferPoint =
                            getElementByPredicate(
                                draftState,
                                'transferPoint',
                                (transferPoint) =>
                                    isInSpecificSimulatedRegion(
                                        transferPoint,
                                        resourceRequiredEvent.requiringSimulatedRegionId
                                    )
                            );
                        addActivity(
                            simulatedRegion,
                            TransferVehiclesActivityState.create(
                                nextUUID(draftState),
                                requiringSimulatedRegionTransferPoint.id,
                                requiringSimulatedRegionTransferPoint.id,
                                resourceRequiredEvent.requiredResource
                            )
                        );
                    }
                    break;
                }
                default:
                // Ignore event
            }
        },
    };
