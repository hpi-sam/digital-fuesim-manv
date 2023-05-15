import { IsUUID } from 'class-validator';
import { difference, groupBy } from 'lodash-es';
import { IsValue } from '../../utils/validators/is-value';
import type { Mutable } from '../../utils';
import {
    StrictObject,
    UUID,
    uuid,
    uuidValidationOptions,
    UUIDSet,
} from '../../utils';
import type { PatientStatus } from '../../models/utils';
import {
    getCreate,
    isInSpecificSimulatedRegion,
    patientStatusAllowedValues,
} from '../../models/utils';
import { Patient } from '../../models/patient';
import type { ExerciseState } from '../../state';
import { addActivity } from '../activities/utils';
import { DelayEventActivityState } from '../activities';
import { nextUUID } from '../utils/randomness';
import { PatientCategoryTransferToHospitalFinishedEvent } from '../events';
import { getElement } from '../../store/action-reducers/utils';
import { IsUUIDSet } from '../../utils/validators';
import { TransferPatientToHospitalActivityState } from '../activities/transfer-patient-to-hospital';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { ResourceDescription } from '../../models/utils/resource-description';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class TransferToHospitalBehaviorState
    implements SimulationBehaviorState
{
    @IsValue('transferToHospitalBehavior')
    readonly type = 'transferToHospitalBehavior';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUIDSet()
    public readonly patientIdsSelectedForTransfer: UUIDSet = {};

    @IsResourceDescription()
    public readonly transferredPatientsCount: ResourceDescription<PatientStatus> =
        {
            black: 0,
            blue: 0,
            green: 0,
            red: 0,
            white: 0,
            yellow: 0,
        };

    static readonly create = getCreate(this);
}

export const transferToHospitalBehavior: SimulationBehavior<TransferToHospitalBehaviorState> =
    {
        behaviorState: TransferToHospitalBehaviorState,
        handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
            switch (event.type) {
                case 'vehicleArrivedEvent': {
                    const vehicle = getElement(
                        draftState,
                        'vehicle',
                        event.vehicleId
                    );

                    if (
                        vehicle.occupation.type !== 'patientTransferOccupation'
                    ) {
                        // This vehicle is not meant to be used for patient transfer
                        break;
                    }

                    const patientsToTransfer: Mutable<UUIDSet> = {};

                    const groupedPatients = groupBy(
                        getOwnPatients(draftState, simulatedRegion.id)
                            .filter(
                                (patient) =>
                                    !Object.keys(
                                        behaviorState.patientIdsSelectedForTransfer
                                    ).includes(patient.id)
                            )
                            .sort((a, b) => a.id.localeCompare(b.id)),
                        (patient) =>
                            getVisiblePatientStatus(patient, draftState)
                    );

                    for (let i = 0; i < vehicle.patientCapacity; i++) {
                        const mostUrgentStatus = (
                            ['red', 'yellow', 'green', 'white', 'blue'] as const
                        ).find(
                            (status) =>
                                (groupedPatients[status]?.length ?? 0) > 0
                        );

                        if (!mostUrgentStatus) {
                            // No more patients to transfer
                            break;
                        }

                        const patientToTransfer =
                            groupedPatients[mostUrgentStatus]![0]!;
                        groupedPatients[mostUrgentStatus]?.splice(0, 1);

                        patientsToTransfer[patientToTransfer.id] = true;
                        behaviorState.patientIdsSelectedForTransfer[
                            patientToTransfer.id
                        ] = true;
                    }

                    if (Object.keys(patientsToTransfer).length === 0) {
                        // No patients to transfer
                        break;
                    }

                    addActivity(
                        simulatedRegion,
                        TransferPatientToHospitalActivityState.create(
                            nextUUID(draftState),
                            patientsToTransfer,
                            event.vehicleId,
                            vehicle.occupation.transportManagementRegionId
                        )
                    );

                    break;
                }
                case 'tickEvent': {
                    const patients = getOwnPatients(
                        draftState,
                        simulatedRegion.id
                    );
                    const selectedPatients = patients.filter((patient) =>
                        Object.keys(
                            behaviorState.patientIdsSelectedForTransfer
                        ).includes(patient.id)
                    );
                    const remainingPatients = difference(
                        patients,
                        selectedPatients
                    );

                    const groupedPatients = groupBy(patients, (patient) =>
                        getVisiblePatientStatus(patient, draftState)
                    );
                    const groupedRemainingPatients = groupBy(
                        remainingPatients,
                        (patient) =>
                            getVisiblePatientStatus(patient, draftState)
                    );

                    StrictObject.keys(patientStatusAllowedValues).forEach(
                        (status) => {
                            // If patients of this triage category just have been in this region
                            if ((groupedPatients[status]?.length ?? 0) > 0) {
                                // But there are no patients of this status right now
                                if (
                                    (groupedRemainingPatients[status]?.length ??
                                        0) === 0
                                ) {
                                    // Then we want to report that we have finished this triage category
                                    // Note:
                                    // These conditions can be true for multiple times in one exercise if patient statuses change or new patients are added
                                    addActivity(
                                        simulatedRegion,
                                        DelayEventActivityState.create(
                                            nextUUID(draftState),
                                            PatientCategoryTransferToHospitalFinishedEvent.create(
                                                status,
                                                true
                                            ),
                                            draftState.currentTime
                                        )
                                    );
                                }
                            }
                        }
                    );

                    selectedPatients.forEach((patient) => {
                        behaviorState.transferredPatientsCount[
                            getVisiblePatientStatus(patient, draftState)
                        ]++;
                    });

                    // The tick event itself is the last event per tick
                    // Therefore, we can reset our state here
                    behaviorState.patientIdsSelectedForTransfer = {};

                    break;
                }
                default:
                // Ignore event
            }
        },
    };

function getOwnPatients(
    draftState: Mutable<ExerciseState>,
    simulatedRegionId: UUID
) {
    return Object.values(draftState.patients).filter((patient) =>
        isInSpecificSimulatedRegion(patient, simulatedRegionId)
    );
}

function getVisiblePatientStatus(patient: Patient, state: ExerciseState) {
    return Patient.getVisibleStatus(
        patient,
        state.configuration.pretriageEnabled,
        state.configuration.bluePatientsEnabled
    );
}
