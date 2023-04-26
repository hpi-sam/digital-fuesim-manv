import { IsUUID } from 'class-validator';
import { getCreate, isInSpecificSimulatedRegion } from '../../models/utils';
import { getElementByPredicate } from '../../store/action-reducers/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { addActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { DelayEventActivityState } from '../activities';
import { TransferVehiclesRequestEvent } from '../events';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AnswerRequestsBehaviorState implements SimulationBehaviorState {
    @IsValue('answerRequestsBehavior')
    readonly type = 'answerRequestsBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    static readonly create = getCreate(this);
}

export const answerRequestsBehavior: SimulationBehavior<AnswerRequestsBehaviorState> =
    {
        behaviorState: AnswerRequestsBehaviorState,
        handleEvent: (draftState, simulatedRegion, _behaviorState, event) => {
            switch (event.type) {
                case 'resourceRequiredEvent': {
                    if (
                        event.requiringSimulatedRegionId !== simulatedRegion.id
                    ) {
                        if (event.requiredResource.type === 'vehicleResource') {
                            const requiringSimulatedRegionTransferPoint =
                                getElementByPredicate(
                                    draftState,
                                    'transferPoint',
                                    (transferPoint) =>
                                        isInSpecificSimulatedRegion(
                                            transferPoint,
                                            event.requiringSimulatedRegionId
                                        )
                                );
                            addActivity(
                                simulatedRegion,
                                DelayEventActivityState.create(
                                    nextUUID(draftState),
                                    TransferVehiclesRequestEvent.create(
                                        event.requiredResource.vehicleCounts,
                                        'transferPoint',
                                        requiringSimulatedRegionTransferPoint.id,
                                        requiringSimulatedRegionTransferPoint.id
                                    ),
                                    draftState.currentTime
                                )
                            );
                        }
                    }
                    break;
                }
                default:
                // Ignore event
            }
        },
    };
