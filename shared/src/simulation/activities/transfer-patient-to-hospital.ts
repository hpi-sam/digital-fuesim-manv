import { IsUUID } from 'class-validator';
import {
    IntermediateOccupation,
    changeOccupation,
    getCreate,
} from '../../models/utils';
import { UUID, UUIDSet, uuidValidationOptions } from '../../utils';
import { IsUUIDSet, IsValue } from '../../utils/validators';
import { sendSimulationEvent } from '../events/utils';
import {
    PatientTransferToHospitalSuccessfulEvent,
    TransferPatientsInSpecificVehicleRequestEvent,
} from '../events';
import { catchAllHospitalId } from '../../data/default-state/catch-all-hospital';
import { getElement, tryGetElement } from '../../store/action-reducers/utils';
import { Patient } from '../../models/patient';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class TransferPatientToHospitalActivityState
    implements SimulationActivityState
{
    @IsValue('transferPatientToHospitalActivity' as const)
    public readonly type = 'transferPatientToHospitalActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsUUIDSet()
    public readonly patientIds: UUIDSet;

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly transferManagementRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        patientIds: UUIDSet,
        vehicleId: UUID,
        transferManagementRegionId: UUID
    ) {
        this.id = id;
        this.patientIds = patientIds;
        this.vehicleId = vehicleId;
        this.transferManagementRegionId = transferManagementRegionId;
    }

    static readonly create = getCreate(this);
}

export const transferPatientToHospitalActivity: SimulationActivity<TransferPatientToHospitalActivityState> =
    {
        activityState: TransferPatientToHospitalActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            tickInterval,
            terminate
        ) {
            const vehicle = tryGetElement(
                draftState,
                'vehicle',
                activityState.vehicleId
            );
            if (
                vehicle === undefined ||
                vehicle.occupation.type !== 'patientTransferOccupation'
            ) {
                terminate();
                return;
            }

            const patients = Object.keys(activityState.patientIds).map(
                (patientId) => getElement(draftState, 'patient', patientId)
            );
            const transferManagementRegion = tryGetElement(
                draftState,
                'simulatedRegion',
                activityState.transferManagementRegionId
            );

            changeOccupation(
                draftState,
                vehicle,
                IntermediateOccupation.create(
                    draftState.currentTime + tickInterval
                )
            );

            sendSimulationEvent(
                simulatedRegion,
                TransferPatientsInSpecificVehicleRequestEvent.create(
                    activityState.patientIds,
                    activityState.vehicleId,
                    'hospital',
                    catchAllHospitalId,
                    simulatedRegion.id
                )
            );

            if (transferManagementRegion !== undefined) {
                patients.forEach((patient) => {
                    sendSimulationEvent(
                        transferManagementRegion,
                        PatientTransferToHospitalSuccessfulEvent.create(
                            Patient.getVisibleStatus(
                                patient,
                                draftState.configuration.pretriageEnabled,
                                draftState.configuration.bluePatientsEnabled
                            ),
                            simulatedRegion.id
                        )
                    );
                });
            }

            terminate();
        },
    };
