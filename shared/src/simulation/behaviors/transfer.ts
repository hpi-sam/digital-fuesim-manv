import {
    IsInt,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { groupBy } from 'lodash-es';
import { Type } from 'class-transformer';
import {
    VehicleResource,
    currentSimulatedRegionOf,
    getCreate,
    isInSimulatedRegion,
    isInSpecificSimulatedRegion,
} from '../../models/utils';
import {
    UUID,
    cloneDeepMutable,
    uuid,
    uuidValidationOptions,
} from '../../utils';
import { IsValue } from '../../utils/validators';
import { addActivity, terminateActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { getElement } from '../../store/action-reducers/utils';
import {
    DelayEventActivityState,
    LoadVehicleActivityState,
    RecurringEventActivityState,
    SendRemoteEventActivityState,
} from '../activities';
import { isUnoccupied } from '../../models/utils/occupations/occupation-helpers-mutable';
import { amountOfResourcesInVehicle } from '../../models/utils/amount-of-resources-in-vehicle';
import type { ResourceDescription } from '../../models/utils/resource-description';
import {
    DoTransferEvent,
    RequestReceivedEvent,
    StartTransferEvent,
    VehiclesSentEvent,
} from '../events';
import { LoadOccupation } from '../../models/utils/occupations/load-occupation';
import { WaitForTransferOccupation } from '../../models/utils/occupations/wait-for-transfer-occupation';
import { TransferVehicleActivityState } from '../activities/transfer-vehicle';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class TransferBehaviorState implements SimulationBehaviorState {
    @IsValue('transferBehavior' as const)
    readonly type = 'transferBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsInt()
    @Min(0)
    public readonly loadTimePerPatient: number;

    @IsInt()
    @Min(0)
    public readonly personnelLoadTime: number;

    @IsInt()
    @Min(0)
    public readonly delayBetweenSends: number;

    @Type(() => StartTransferEvent)
    @ValidateNested()
    public readonly startTransferEventQueue: readonly StartTransferEvent[] = [];

    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly recurringActivityId: UUID | undefined;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        loadTimePerPatient: number = 60_000, // 1 minute
        personnelLoadTime: number = 120_000, // 2 minutes
        delayBetweenSends: number = 60_000 // 1 minute
    ) {
        this.loadTimePerPatient = loadTimePerPatient;
        this.personnelLoadTime = personnelLoadTime;
        this.delayBetweenSends = delayBetweenSends;
    }

    static readonly create = getCreate(this);
}

export const transferBehavior: SimulationBehavior<TransferBehaviorState> = {
    behaviorState: TransferBehaviorState,
    handleEvent(draftState, simulatedRegion, behaviorState, event) {
        switch (event.type) {
            case 'transferPatientsRequestEvent':
                {
                    // find a vehicle to use

                    const vehicles = Object.values(draftState.vehicles)
                        .filter((vehicle) =>
                            isInSpecificSimulatedRegion(
                                vehicle,
                                simulatedRegion.id
                            )
                        )
                        .filter(
                            (vehicle) =>
                                Object.keys(vehicle.patientIds).length === 0
                        );
                    const vehiclesOfCorrectType = vehicles.filter(
                        (vehicle) => vehicle.type === event.vehicleType
                    );

                    // sort the unoccupied vehicles by number of loaded resources descending and use the one with the most

                    const vehicleToLoad = vehiclesOfCorrectType
                        .filter((vehicle) =>
                            isUnoccupied(vehicle, draftState.currentTime)
                        )
                        .sort(
                            (vehicle1, vehicle2) =>
                                amountOfResourcesInVehicle(
                                    draftState,
                                    vehicle2.id
                                ) -
                                amountOfResourcesInVehicle(
                                    draftState,
                                    vehicle1.id
                                )
                        )[0];

                    if (vehicleToLoad) {
                        const activityId = nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            LoadVehicleActivityState.create(
                                activityId,
                                vehicleToLoad.id,
                                event.transferDestinationType,
                                event.transferDestinationId,
                                event.patientIds,
                                behaviorState.loadTimePerPatient,
                                behaviorState.personnelLoadTime
                            )
                        );
                        vehicleToLoad.occupation = cloneDeepMutable(
                            LoadOccupation.create(activityId)
                        );
                    }
                }
                break;
            case 'transferPatientsInSpecificVehicleRequestEvent':
                {
                    const vehicle = getElement(
                        draftState,
                        'vehicle',
                        event.vehicleId
                    );
                    // Don't do anything if vehicle is occupied
                    if (!isUnoccupied(vehicle, draftState.currentTime)) {
                        return;
                    }

                    const activityId = nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        LoadVehicleActivityState.create(
                            activityId,
                            vehicle.id,
                            event.transferDestinationType,
                            event.transferDestinationId,
                            event.patientIds,
                            behaviorState.loadTimePerPatient,
                            behaviorState.personnelLoadTime
                        )
                    );
                    vehicle.occupation = cloneDeepMutable(
                        LoadOccupation.create(activityId)
                    );
                }
                break;
            case 'transferSpecificVehicleRequestEvent':
                {
                    const vehicle = getElement(
                        draftState,
                        'vehicle',
                        event.vehicleId
                    );
                    // Don't do anything if vehicle is occupied
                    if (!isUnoccupied(vehicle, draftState.currentTime)) {
                        return;
                    }

                    const activityId = nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        LoadVehicleActivityState.create(
                            activityId,
                            vehicle.id,
                            event.transferDestinationType,
                            event.transferDestinationId,
                            {},
                            behaviorState.loadTimePerPatient,
                            behaviorState.personnelLoadTime,
                            undefined,
                            event.successorOccupation
                        )
                    );
                    vehicle.occupation = cloneDeepMutable(
                        LoadOccupation.create(activityId)
                    );
                }
                break;
            case 'transferVehiclesRequestEvent':
                {
                    // group vehicles

                    const vehicles = Object.values(draftState.vehicles)
                        .filter((vehicle) =>
                            isInSpecificSimulatedRegion(
                                vehicle,
                                simulatedRegion.id
                            )
                        )
                        .filter(
                            (vehicle) =>
                                Object.keys(vehicle.patientIds).length === 0
                        );
                    const groupedVehicles = groupBy(
                        vehicles,
                        (vehicle) => vehicle.vehicleType
                    );

                    const sentVehicles: ResourceDescription = {};

                    Object.entries(event.requestedVehicles).forEach(
                        ([vehicleType, vehicleAmount]) => {
                            // sort the unoccupied vehicles by number of loaded resources descending and use the one with the most

                            const loadableVehicles = groupedVehicles[
                                vehicleType
                            ]
                                ?.filter((vehicle) =>
                                    isUnoccupied(
                                        vehicle,
                                        draftState.currentTime
                                    )
                                )
                                .sort(
                                    (vehicle1, vehicle2) =>
                                        amountOfResourcesInVehicle(
                                            draftState,
                                            vehicle2.id
                                        ) -
                                        amountOfResourcesInVehicle(
                                            draftState,
                                            vehicle1.id
                                        )
                                );

                            sentVehicles[vehicleType] = 0;

                            for (
                                let index = 0;
                                index <
                                Math.min(
                                    loadableVehicles?.length ?? 0,
                                    vehicleAmount
                                );
                                index++
                            ) {
                                const activityId = nextUUID(draftState);
                                addActivity(
                                    simulatedRegion,
                                    LoadVehicleActivityState.create(
                                        activityId,
                                        loadableVehicles![index]!.id,
                                        event.transferDestinationType,
                                        event.transferDestinationId,
                                        {},
                                        behaviorState.loadTimePerPatient,
                                        behaviorState.personnelLoadTime,
                                        undefined,
                                        cloneDeepMutable(
                                            event.successorOccupation
                                        )
                                    )
                                );
                                loadableVehicles![index]!.occupation =
                                    cloneDeepMutable(
                                        LoadOccupation.create(activityId)
                                    );
                                sentVehicles[vehicleType]++;
                            }
                        }
                    );

                    // Send RequestReceivedEvent into own region

                    addActivity(
                        simulatedRegion,
                        DelayEventActivityState.create(
                            nextUUID(draftState),
                            RequestReceivedEvent.create(
                                sentVehicles,
                                event.transferDestinationType,
                                event.transferDestinationId,
                                event.key
                            ),
                            draftState.currentTime
                        )
                    );

                    // Send event to destination if it is a simulated region

                    if (
                        event.transferDestinationType === 'transferPoint' &&
                        isInSimulatedRegion(
                            getElement(
                                draftState,
                                'transferPoint',
                                event.transferDestinationId
                            )
                        )
                    ) {
                        addActivity(
                            simulatedRegion,
                            SendRemoteEventActivityState.create(
                                nextUUID(draftState),
                                currentSimulatedRegionOf(
                                    draftState,
                                    getElement(
                                        draftState,
                                        'transferPoint',
                                        event.transferDestinationId
                                    )
                                ).id,
                                VehiclesSentEvent.create(
                                    VehicleResource.create(sentVehicles)
                                )
                            )
                        );
                    }
                }
                break;
            case 'startTransferEvent':
                {
                    const vehicle = getElement(
                        draftState,
                        'vehicle',
                        event.vehicleId
                    );
                    vehicle.occupation = cloneDeepMutable(
                        WaitForTransferOccupation.create()
                    );

                    behaviorState.startTransferEventQueue.push(event);
                }
                break;
            case 'tickEvent':
                {
                    if (
                        behaviorState.recurringActivityId === undefined &&
                        behaviorState.startTransferEventQueue.length !== 0
                    ) {
                        behaviorState.recurringActivityId =
                            nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            RecurringEventActivityState.create(
                                behaviorState.recurringActivityId,
                                DoTransferEvent.create(),
                                draftState.currentTime,
                                behaviorState.delayBetweenSends
                            )
                        );
                    }
                }
                break;
            case 'doTransferEvent':
                {
                    if (
                        behaviorState.startTransferEventQueue.length === 0 &&
                        behaviorState.recurringActivityId
                    ) {
                        terminateActivity(
                            draftState,
                            simulatedRegion,
                            behaviorState.recurringActivityId
                        );
                        behaviorState.recurringActivityId = undefined;
                        return;
                    }

                    const transferEvent =
                        behaviorState.startTransferEventQueue.shift();
                    const vehicle =
                        draftState.vehicles[transferEvent!.vehicleId];
                    if (
                        vehicle?.occupation.type !== 'waitForTransferOccupation'
                    ) {
                        return;
                    }
                    addActivity(
                        simulatedRegion,
                        TransferVehicleActivityState.create(
                            nextUUID(draftState),
                            vehicle.id,
                            transferEvent!.transferDestinationType,
                            transferEvent!.transferDestinationId,
                            transferEvent!.key,
                            cloneDeepMutable(transferEvent!.successorOccupation)
                        )
                    );
                }
                break;
            default:
            // ignore event
        }
    },
};
