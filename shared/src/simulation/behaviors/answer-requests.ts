import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
    VehicleResource,
    getCreate,
    isInSpecificSimulatedRegion,
} from '../../models/utils/index.js';
import { getElementByPredicate } from '../../store/action-reducers/utils/index.js';
import type { UUID } from '../../utils/index.js';
import {
    cloneDeepMutable,
    uuid,
    uuidValidationOptions,
} from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { addActivity } from '../activities/utils.js';
import { nextUUID } from '../utils/randomness.js';
import { DelayEventActivityState } from '../activities/index.js';
import {
    ResourceRequiredEvent,
    TransferVehiclesRequestEvent,
} from '../events/index.js';
import type { ResourceDescription } from '../../models/utils/resource-description.js';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior.js';

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
                            const eventToSend =
                                TransferVehiclesRequestEvent.create(
                                    event.requiredResource.vehicleCounts,
                                    'transferPoint',
                                    requiringSimulatedRegionTransferPoint.id,
                                    event.requiringSimulatedRegionId,
                                    requiringSimulatedRegionTransferPoint.id +
                                        behaviorState.requestsHandled
                                );
                            behaviorState.receivedEvents.push(
                                cloneDeepMutable(eventToSend)
                            );
                            addActivity(
                                simulatedRegion,
                                DelayEventActivityState.create(
                                    nextUUID(draftState),
                                    eventToSend,
                                    draftState.currentTime
                                )
                            );
                        }
                    }
                    break;
                }
                case 'requestReceivedEvent':
                    {
                        const requestEventIndex =
                            behaviorState.receivedEvents.findIndex(
                                (receivedEvent) =>
                                    receivedEvent.key === event.key
                            );
                        const requestEvent =
                            behaviorState.receivedEvents[requestEventIndex];
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
                            behaviorState.receivedEvents.splice(
                                requestEventIndex,
                                1
                            );
                        }

                        // createEvent might be set to `true` in the `forEach` arrow function
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (createEvent) {
                            addActivity(
                                simulatedRegion,
                                DelayEventActivityState.create(
                                    nextUUID(draftState),
                                    ResourceRequiredEvent.create(
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
