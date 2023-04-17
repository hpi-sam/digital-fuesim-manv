import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { groupBy } from 'lodash-es';
import {
    MissingTransferConnectionRadiogram,
    RadiogramUnpublishedStatus,
} from '../../models/radiogram';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import {
    currentSimulatedRegionIdOf,
    getCreate,
    isInSimulatedRegion,
    isInSpecificSimulatedRegion,
    TransferStartPoint,
} from '../../models/utils';
import { amountOfResourcesInVehicle } from '../../models/utils/amount-of-resources-in-vehicle';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { TransferActionReducers } from '../../store/action-reducers/transfer';
import {
    getElement,
    getElementByPredicate,
} from '../../store/action-reducers/utils';
import { completelyLoadVehicle } from '../../store/action-reducers/utils/completely-load-vehicle';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import {
    ResourceRequiredEvent,
    TransferConnectionMissingEvent,
    VehiclesSentEvent,
    VehicleTransferSuccessfulEvent,
} from '../events';
import { sendSimulationEvent } from '../events/utils';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class TransferVehiclesActivityState implements SimulationActivityState {
    @IsValue('transferVehiclesActivity' as const)
    public readonly type = 'transferVehiclesActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId: UUID;

    @IsString()
    public readonly key: string;

    @ValidateNested()
    @Type(() => VehicleResource)
    public readonly vehiclesToBeTransferred: VehicleResource;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        targetTransferPointId: UUID,
        key: string,
        vehiclesToBeTransferred: VehicleResource
    ) {
        this.id = id;
        this.targetTransferPointId = targetTransferPointId;
        this.key = key;
        this.vehiclesToBeTransferred = vehiclesToBeTransferred;
    }

    static readonly create = getCreate(this);
}

export const transferVehiclesActivity: SimulationActivity<TransferVehiclesActivityState> =
    {
        activityState: TransferVehiclesActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            const ownTransferPoint = getElementByPredicate(
                draftState,
                'transferPoint',
                (transferPoint) =>
                    isInSpecificSimulatedRegion(
                        transferPoint,
                        simulatedRegion.id
                    )
            );

            if (
                ownTransferPoint.reachableTransferPoints[
                    activityState.targetTransferPointId
                ] === undefined
            ) {
                sendSimulationEvent(
                    simulatedRegion,
                    TransferConnectionMissingEvent.create(
                        nextUUID(draftState),
                        activityState.targetTransferPointId
                    )
                );
                publishRadiogram(
                    draftState,
                    cloneDeepMutable(
                        MissingTransferConnectionRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create(),
                            activityState.targetTransferPointId
                        )
                    )
                );
                terminate();
                return;
            }

            const vehicles = Object.values(draftState.vehicles)
                .filter((vehicle) =>
                    isInSpecificSimulatedRegion(vehicle, simulatedRegion.id)
                )
                .filter(
                    (vehicle) => Object.keys(vehicle.patientIds).length === 0
                );
            const groupedVehicles = groupBy(
                vehicles,
                (vehicle) => vehicle.vehicleType
            );

            if (
                Object.entries(
                    activityState.vehiclesToBeTransferred.vehicleCounts
                ).some(
                    ([vehicleType, vehicleCount]) =>
                        (groupedVehicles[vehicleType]?.length ?? 0) <
                        vehicleCount
                )
            ) {
                const missingVehicles: { [key: string]: number } = {};
                Object.entries(
                    activityState.vehiclesToBeTransferred.vehicleCounts
                ).forEach(([vehicleType, vehicleCount]) => {
                    if (
                        (groupedVehicles[vehicleType]?.length ?? 0) <
                        vehicleCount
                    ) {
                        missingVehicles[vehicleType] =
                            vehicleCount -
                            (groupedVehicles[vehicleType]?.length ?? 0);
                    }
                });
                sendSimulationEvent(
                    simulatedRegion,
                    ResourceRequiredEvent.create(
                        nextUUID(draftState),
                        simulatedRegion.id,
                        VehicleResource.create(missingVehicles),
                        activityState.key
                    )
                );
            }

            const sentVehicles: { [key: string]: number } = {};
            Object.entries(
                activityState.vehiclesToBeTransferred.vehicleCounts
            ).forEach(([vehicleType, vehicleCount]) => {
                sentVehicles[vehicleType] = Math.min(
                    groupedVehicles[vehicleType]?.length ?? 0,
                    vehicleCount
                );
                // sort the vehicles by number of loaded resources descending
                groupedVehicles[vehicleType]?.sort(
                    (a, b) =>
                        amountOfResourcesInVehicle(draftState, b.id) -
                        amountOfResourcesInVehicle(draftState, a.id)
                );
                for (let i = 0; i < sentVehicles[vehicleType]!; i++) {
                    completelyLoadVehicle(
                        draftState,
                        groupedVehicles[vehicleType]![i]!
                    );

                    TransferActionReducers.addToTransfer.reducer(draftState, {
                        type: '[Transfer] Add to transfer',
                        elementType: 'vehicle',
                        elementId: groupedVehicles[vehicleType]![i]!.id,
                        startPoint: TransferStartPoint.create(
                            ownTransferPoint.id
                        ),
                        targetTransferPointId:
                            activityState.targetTransferPointId,
                    });
                }
            });

            const targetTransferPoint = getElement(
                draftState,
                'transferPoint',
                activityState.targetTransferPointId
            );
            if (Object.values(sentVehicles).some((value) => value !== 0)) {
                sendSimulationEvent(
                    simulatedRegion,
                    VehicleTransferSuccessfulEvent.create(
                        nextUUID(draftState),
                        targetTransferPoint.id,
                        activityState.key,
                        VehicleResource.create(sentVehicles)
                    )
                );

                if (isInSimulatedRegion(targetTransferPoint)) {
                    sendSimulationEvent(
                        getElement(
                            draftState,
                            'simulatedRegion',
                            currentSimulatedRegionIdOf(targetTransferPoint)
                        ),
                        VehiclesSentEvent.create(
                            nextUUID(draftState),
                            VehicleResource.create(sentVehicles)
                        )
                    );
                }
            }

            terminate();
        },
    };
