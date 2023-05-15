import { IsUUID } from 'class-validator';
import { groupBy } from 'lodash-es';
import { IsValue } from '../../utils/validators/is-value';
import { StrictObject, UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from '../../models/utils/get-create';
import { isInSpecificSimulatedRegion } from '../../models/utils/position/position-helpers';
import type { PatientCount } from '../../models/radiogram/patient-count-radiogram';
import { Patient } from '../../models/patient';
import { sendSimulationEvent } from '../events/utils';
import { PatientsCountedEvent } from '../events/patients-counted';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';
import { PatientStatus } from '../../models/utils/patient-status';

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
                ).map(([visibleStatus, patients]) => [
                    visibleStatus as PatientStatus,
                    patients.length,
                ])
            );

            sendSimulationEvent(
                simulatedRegion,
                PatientsCountedEvent.create(patientCount)
            );

            terminate();
        },
    };
