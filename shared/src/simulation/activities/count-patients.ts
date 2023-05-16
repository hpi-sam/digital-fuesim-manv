import { IsUUID } from 'class-validator';
import { groupBy } from 'lodash-es';
import { IsValue } from '../../utils/validators/is-value';
import { StrictObject, UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from '../../models/utils/get-create';
import { isInSpecificSimulatedRegion } from '../../models/utils/position/position-helpers';
import { Patient } from '../../models/patient';
import { sendSimulationEvent } from '../events/utils';
import { PatientsCountedEvent } from '../events/patients-counted';
import type { PatientStatus } from '../../models/utils/patient-status';
import { patientStatusAllowedValues } from '../../models/utils/patient-status';
import type { ResourceDescription } from '../../models/utils/resource-description';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class CountPatientsActivityState implements SimulationActivityState {
    @IsValue('countPatientsActivity' as const)
    public readonly type = 'countPatientsActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(id: UUID) {
        this.id = id;
    }

    static readonly create = getCreate(this);
}

export const countPatientsActivity: SimulationActivity<CountPatientsActivityState> =
    {
        activityState: CountPatientsActivityState,
        tick(
            draftState,
            simulatedRegion,
            _activityState,
            _tickInterval,
            terminate
        ) {
            const patients = Object.values(draftState.patients).filter(
                (patient) =>
                    isInSpecificSimulatedRegion(patient, simulatedRegion.id)
            );
            const patientCount = StrictObject.fromEntries(
                StrictObject.entries(
                    groupBy(patients, (patient) =>
                        Patient.getVisibleStatus(
                            patient,
                            draftState.configuration.pretriageEnabled,
                            draftState.configuration.bluePatientsEnabled
                        )
                    )
                ).map(([visibleStatus, patientsOfStatus]) => [
                    visibleStatus as PatientStatus,
                    patientsOfStatus.length,
                ])
            );

            StrictObject.keys(patientStatusAllowedValues).forEach(
                (patientStatus) => {
                    if (patientCount[patientStatus] === undefined)
                        patientCount[patientStatus] = 0;
                }
            );

            sendSimulationEvent(
                simulatedRegion,
                PatientsCountedEvent.create(
                    patientCount as ResourceDescription<PatientStatus>
                )
            );

            terminate();
        },
    };
