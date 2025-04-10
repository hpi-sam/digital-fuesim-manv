import { getCreate } from '../../models/utils/get-create.js';
import type { PatientStatus } from '../../models/utils/patient-status.js';
import { patientStatusAllowedValues } from '../../models/utils/patient-status.js';
import type { ResourceDescription } from '../../models/utils/resource-description.js';
import { IsValue } from '../../utils/validators/index.js';
import { IsResourceDescription } from '../../utils/validators/is-resource-description.js';
import type { SimulationEvent } from './simulation-event.js';

export class PatientsCountedEvent implements SimulationEvent {
    @IsValue('patientsCountedEvent')
    readonly type = 'patientsCountedEvent';

    @IsResourceDescription(patientStatusAllowedValues)
    readonly patientCount: ResourceDescription<PatientStatus>;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(patientCount: ResourceDescription<PatientStatus>) {
        this.patientCount = patientCount;
    }

    static readonly create = getCreate(this);
}
