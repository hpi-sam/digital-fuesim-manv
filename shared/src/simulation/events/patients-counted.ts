import { PatientCount } from '../../models/radiogram';
import { getCreate } from '../../models/utils';
import { IsValue } from '../../utils/validators';
import { IsPatientCount } from '../../utils/validators/is-patient-count';
import type { SimulationEvent } from './simulation-event';

export class PatientsCountedEvent implements SimulationEvent {
    @IsValue('patientsCountedEvent')
    readonly type = 'patientsCountedEvent';

    @IsPatientCount()
    readonly patientCount: PatientCount;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(patientCount: PatientCount) {
        this.patientCount = patientCount;
    }

    static readonly create = getCreate(this);
}
