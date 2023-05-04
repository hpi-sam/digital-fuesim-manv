import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import {
    SimulatedRegionPosition,
    VehiclePosition,
    getCreate,
    isInSpecificSimulatedRegion,
} from '../../models/utils';
import {
    UUID,
    UUIDSet,
    cloneDeepMutable,
    uuidValidationOptions,
} from '../../utils';
import { IsLiteralUnion, IsUUIDSet, IsValue } from '../../utils/validators';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import { getElement } from '../../store/action-reducers/utils';
import { sendSimulationEvent } from '../events/utils';
import {
    MaterialRemovedEvent,
    NewPatientEvent,
    PatientRemovedEvent,
    PersonnelRemovedEvent,
    StartTransferEvent,
} from '../events';
import { completelyLoadVehicle } from '../../store/action-reducers/utils/completely-load-vehicle';
import { IntermediateOccupation } from '../../models/utils/occupations/intermediate-occupation';
import { changePositionWithId } from '../../models/utils/position/position-helpers-mutable';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class LoadVehicleActivityState implements SimulationActivityState {
    @IsValue('loadVehicleActivity' as const)
    public readonly type = 'loadVehicleActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsUUIDSet()
    public readonly patientsToBeLoaded: UUIDSet;

    @IsInt()
    @Min(0)
    public readonly loadDelay: number;

    @IsOptional()
    @IsString()
    public readonly key?: string;

    @IsBoolean()
    public readonly hasBeenStarted: boolean = false;

    @IsInt()
    @Min(0)
    public readonly startTime: number = 0;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        patientsToBeLoaded: UUIDSet,
        loadDelay: number,
        key?: string
    ) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.patientsToBeLoaded = patientsToBeLoaded;
        this.loadDelay = loadDelay;
        this.key = key;
    }

    static readonly create = getCreate(this);
}

export const loadVehicleActivity: SimulationActivity<LoadVehicleActivityState> =
    {
        activityState: LoadVehicleActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            tickInterval,
            terminate
        ) {
            const vehicle = getElement(
                draftState,
                'vehicle',
                activityState.vehicleId
            );

            // Start load process only once

            if (!activityState.hasBeenStarted) {
                // Send remove events

                Object.keys(vehicle.personnelIds).forEach((personnelId) => {
                    const personnel = getElement(
                        draftState,
                        'personnel',
                        personnelId
                    );
                    if (
                        isInSpecificSimulatedRegion(
                            personnel,
                            simulatedRegion.id
                        )
                    ) {
                        sendSimulationEvent(
                            simulatedRegion,
                            PersonnelRemovedEvent.create(personnelId)
                        );
                    }
                });
                Object.keys(vehicle.materialIds).forEach((materialId) => {
                    const material = getElement(
                        draftState,
                        'material',
                        materialId
                    );
                    if (
                        isInSpecificSimulatedRegion(
                            material,
                            simulatedRegion.id
                        )
                    ) {
                        sendSimulationEvent(
                            simulatedRegion,
                            MaterialRemovedEvent.create(materialId)
                        );
                    }
                });
                Object.keys(activityState.patientsToBeLoaded).forEach(
                    (patientId) => {
                        const patient = getElement(
                            draftState,
                            'patient',
                            patientId
                        );
                        if (
                            isInSpecificSimulatedRegion(
                                patient,
                                simulatedRegion.id
                            )
                        ) {
                            sendSimulationEvent(
                                simulatedRegion,
                                PatientRemovedEvent.create(patientId)
                            );
                        }
                    }
                );

                // Load material and personnel

                completelyLoadVehicle(draftState, vehicle);

                // Load patients (and unload patients not to be loaded)

                Object.keys(vehicle.patientIds).forEach((patientId) => {
                    changePositionWithId(
                        patientId,
                        SimulatedRegionPosition.create(simulatedRegion.id),
                        'patient',
                        draftState
                    );
                    // Inform the region that a new patient has left the vehicle
                    // (Only if it actually left the vehicle and will not be instantly re-added)
                    if (!activityState.patientsToBeLoaded[patientId]) {
                        sendSimulationEvent(
                            simulatedRegion,
                            NewPatientEvent.create(patientId)
                        );
                    }
                });

                vehicle.patientIds = cloneDeepMutable(
                    activityState.patientsToBeLoaded
                );

                Object.keys(vehicle.patientIds).forEach((patientId) => {
                    changePositionWithId(
                        patientId,
                        VehiclePosition.create(vehicle.id),
                        'patient',
                        draftState
                    );
                });

                activityState.hasBeenStarted = true;
                activityState.startTime = draftState.currentTime;
            }

            if (
                activityState.startTime + activityState.loadDelay <=
                draftState.currentTime
            ) {
                // terminate if the occupation has changed
                if (
                    vehicle.occupation.type !== 'loadOccupation' ||
                    vehicle.occupation.loadingActivityId !== activityState.id
                ) {
                    terminate();
                    return;
                }
                sendSimulationEvent(
                    simulatedRegion,
                    StartTransferEvent.create(
                        activityState.vehicleId,
                        activityState.transferDestinationType,
                        activityState.transferDestinationId,
                        activityState.key
                    )
                );

                vehicle.occupation = cloneDeepMutable(
                    IntermediateOccupation.create(
                        draftState.currentTime + tickInterval
                    )
                );

                terminate();
            }
        },
    };
