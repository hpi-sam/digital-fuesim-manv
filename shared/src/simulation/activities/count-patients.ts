import { IsUUID } from 'class-validator';
import { groupBy } from 'lodash-es';
import { IsValue } from '../../utils/validators/is-value';
import { UUID, uuidValidationOptions } from '../../utils';
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
            const patientCount: PatientCount = {
                red: 0,
                yellow: 0,
                green: 0,
                blue: 0,
                black: 0,
                white: 0,
            };
            const patients = Object.values(draftState.patients).filter(
                (patient) =>
                    isInSpecificSimulatedRegion(patient, simulatedRegion.id)
            );
            const groupedPatients = groupBy(patients, (patient) =>
                Patient.getVisibleStatus(
                    patient,
                    draftState.configuration.pretriageEnabled,
                    draftState.configuration.bluePatientsEnabled
                )
            );
            patientCount.black = groupedPatients['black']?.length ?? 0;
            patientCount.white = groupedPatients['white']?.length ?? 0;
            patientCount.red = groupedPatients['red']?.length ?? 0;
            patientCount.yellow = groupedPatients['yellow']?.length ?? 0;
            patientCount.green = groupedPatients['green']?.length ?? 0;
            patientCount.blue = groupedPatients['blue']?.length ?? 0;

            sendSimulationEvent(
                simulatedRegion,
                PatientsCountedEvent.create(patientCount)
            );

            terminate();
        },
    };
