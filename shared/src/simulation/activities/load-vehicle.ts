import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { difference } from 'lodash-es';
import { Type } from 'class-transformer';
import {
    ExerciseOccupation,
    SimulatedRegionPosition,
    VehiclePosition,
    getCreate,
    isInSpecificSimulatedRegion,
    occupationTypeOptions,
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
    @IsOptional()
    public readonly loadDelay?: number = undefined;

    @IsInt()
    @Min(0)
    public readonly loadTimePerPatient: number;

    @IsInt()
    @Min(0)
    public readonly personnelLoadTime: number;

    @IsOptional()
    @IsString()
    public readonly key?: string;

    @IsBoolean()
    public readonly hasBeenStarted: boolean = false;

    @IsInt()
    @Min(0)
    public readonly startTime: number = 0;

    @IsOptional()
    @Type(...occupationTypeOptions)
    readonly successorOccupation?: ExerciseOccupation;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        patientsToBeLoaded: UUIDSet,
        loadTimePerPatient: number,
        personnelLoadTime: number,
        key?: string,
        successorOccupation?: ExerciseOccupation
    ) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.patientsToBeLoaded = patientsToBeLoaded;
        this.loadTimePerPatient = loadTimePerPatient;
        this.personnelLoadTime = personnelLoadTime;
        this.key = key;
        this.successorOccupation = successorOccupation;
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

                let personnelToLoadCount = 0;

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
                        personnelToLoadCount++;
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

                const patientsToUnload = difference(
                    Object.keys(vehicle.patientIds),
                    Object.keys(activityState.patientsToBeLoaded)
                );
                const patientsToLoad = difference(
                    Object.keys(activityState.patientsToBeLoaded),
                    Object.keys(vehicle.patientIds)
                );

                patientsToUnload.forEach((patientId) => {
                    changePositionWithId(
                        patientId,
                        SimulatedRegionPosition.create(simulatedRegion.id),
                        'patient',
                        draftState
                    );

                    // Inform the region that a new patient has left the vehicle
                    sendSimulationEvent(
                        simulatedRegion,
                        NewPatientEvent.create(patientId)
                    );
                });

                vehicle.patientIds = cloneDeepMutable(
                    activityState.patientsToBeLoaded
                );

                patientsToLoad.forEach((patientId) => {
                    changePositionWithId(
                        patientId,
                        VehiclePosition.create(vehicle.id),
                        'patient',
                        draftState
                    );
                });

                const patientMovementsCount =
                    patientsToUnload.length + patientsToLoad.length;

                // Personnel has to leave and reenter the vehicle if patients are unloaded or loaded
                const personnelLoadingRequired =
                    personnelToLoadCount > 0 || patientMovementsCount > 0;

                // Calculate loading time based on the patients and personnel to be loaded
                // Do not do the calculation if the time is already set (which could occur if an instance of this activity was imported from an older state version)
                if (activityState.loadDelay === undefined) {
                    activityState.loadDelay =
                        patientMovementsCount *
                            activityState.loadTimePerPatient +
                        (personnelLoadingRequired
                            ? activityState.personnelLoadTime
                            : 0);
                }

                activityState.hasBeenStarted = true;
                activityState.startTime = draftState.currentTime;
            }

            if (
                activityState.loadDelay !== undefined &&
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
                        activityState.key,
                        cloneDeepMutable(activityState.successorOccupation)
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
