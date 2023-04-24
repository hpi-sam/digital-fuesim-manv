import { IsOptional, IsString, IsUUID } from 'class-validator';
import {
    MissingTransferConnectionRadiogram,
    RadiogramUnpublishedStatus,
} from '../../models/radiogram';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import {
    getCreate,
    isInSpecificSimulatedRegion,
    TransferStartPoint,
} from '../../models/utils';
import { VehicleResource } from '../../models/utils/rescue-resource';
import { TransferActionReducers } from '../../store/action-reducers/transfer';
import {
    getElement,
    getElementByPredicate,
} from '../../store/action-reducers/utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    TransferConnectionMissingEvent,
    VehicleTransferSuccessfulEvent,
} from '../events';
import { sendSimulationEvent } from '../events/utils';
import { nextUUID } from '../utils/randomness';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class TransferVehicleActivityState implements SimulationActivityState {
    @IsValue('transferVehicleActivity' as const)
    public readonly type = 'transferVehicleActivity';

    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsOptional()
    @IsString()
    readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        key?: string
    ) {
        this.id = id;
        this.vehicleId = vehicleId;

        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.key = key;
    }

    static readonly create = getCreate(this);
}

export const transferVehicleActivity: SimulationActivity<TransferVehicleActivityState> =
    {
        activityState: TransferVehicleActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            const vehicle = getElement(
                draftState,
                'vehicle',
                activityState.vehicleId
            );

            if (activityState.transferDestinationType === 'transferPoint') {
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
                        activityState.transferDestinationId
                    ] === undefined
                ) {
                    sendSimulationEvent(
                        simulatedRegion,
                        TransferConnectionMissingEvent.create(
                            nextUUID(draftState),
                            activityState.transferDestinationId,
                            activityState.key
                        )
                    );
                    publishRadiogram(
                        draftState,
                        cloneDeepMutable(
                            MissingTransferConnectionRadiogram.create(
                                nextUUID(draftState),
                                simulatedRegion.id,
                                RadiogramUnpublishedStatus.create(),
                                activityState.transferDestinationId
                            )
                        )
                    );
                    terminate();
                    return;
                }

                // If the vehicle is not completely loaded terminate
                if (
                    Object.keys(vehicle.materialIds).some((materialId) => {
                        const material = getElement(
                            draftState,
                            'material',
                            materialId
                        );
                        return !isInSpecificSimulatedRegion(
                            material,
                            simulatedRegion.id
                        );
                    }) ||
                    Object.keys(vehicle.personnelIds).some((personnelId) => {
                        const material = getElement(
                            draftState,
                            'personnel',
                            personnelId
                        );
                        return !isInSpecificSimulatedRegion(
                            material,
                            simulatedRegion.id
                        );
                    })
                ) {
                    terminate();
                    return;
                }

                // Do transfer and send event

                TransferActionReducers.addToTransfer.reducer(draftState, {
                    type: '[Transfer] Add to transfer',
                    elementType: 'vehicle',
                    elementId: activityState.vehicleId,
                    startPoint: TransferStartPoint.create(ownTransferPoint.id),
                    targetTransferPointId: activityState.transferDestinationId,
                });

                const vehicleResourceDescription: { [key: string]: 1 } = {};
                vehicleResourceDescription[vehicle.vehicleType] = 1;

                sendSimulationEvent(
                    simulatedRegion,
                    VehicleTransferSuccessfulEvent.create(
                        activityState.transferDestinationId,
                        activityState.key ?? '',
                        VehicleResource.create(vehicleResourceDescription)
                    )
                );

                terminate();
            }
        },
    };
