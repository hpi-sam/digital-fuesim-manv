import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
    VehicleResource,
    getCreate,
    isInSpecificSimulatedRegion,
} from '../../models/utils';
import { getElementByPredicate } from '../../store/action-reducers/utils';
import { UUID, uuid, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { addActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { DelayEventActivityState } from '../activities';
import { ResourceRequiredEvent, TransferVehiclesRequestEvent } from '../events';
import type { ResourceDescription } from '../../models/utils/resource-description';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class AnswerRequestsBehaviorState implements SimulationBehaviorState {
    @IsValue('answerRequestsBehavior')
    readonly type = 'answerRequestsBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @Type(() => TransferVehiclesRequestEvent)
    @ValidateNested()
    public readonly receivedEvents: readonly TransferVehiclesRequestEvent[] =
        [];

    @IsInt()
    @Min(0)
    public readonly requestsHandled: number = 0;

    static readonly create = getCreate(this);
}

export const answerRequestsBehavior: SimulationBehavior<AnswerRequestsBehaviorState> =
    {
        behaviorState: AnswerRequestsBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
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
                                        requiringSimulatedRegionTransferPoint.id +
                                            behaviorState.requestsHandled
                                    ),
                                    draftState.currentTime
                                )
                            );
                        }
                    }
                    break;
                }
                case 'requestReceivedEvent':
                    {
                        const requestEvent = behaviorState.receivedEvents.find(
                            (receivedEvent) => receivedEvent.key === event.key
                        );
                        let createEvent = false;
                        const vehiclesNotAvailable: ResourceDescription = {};
                        if (requestEvent) {
                            Object.entries(
                                requestEvent.requestedVehicles
                            ).forEach(
                                ([vehicleType, requestedVehicleAmount]) => {
                                    if (
                                        (event.availableVehicles[vehicleType] ??
                                            0) < requestedVehicleAmount
                                    ) {
                                        vehiclesNotAvailable[vehicleType] =
                                            requestedVehicleAmount -
                                            (event.availableVehicles[
                                                vehicleType
                                            ] ?? 0);
                                        createEvent = true;
                                    }
                                }
                            );
                        }
                        if (createEvent) {
                            addActivity(
                                simulatedRegion,
                                DelayEventActivityState.create(
                                    nextUUID(draftState),
                                    ResourceRequiredEvent.create(
                                        '',
                                        simulatedRegion.id,
                                        VehicleResource.create(
                                            vehiclesNotAvailable
                                        ),
                                        requestEvent!.key ?? ''
                                    ),
                                    draftState.currentTime
                                )
                            );
                        }
                    }
                    break;
                default:
                // Ignore event
            }
        },
    };
