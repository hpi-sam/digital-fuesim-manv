import type { PatientStatus } from '../../models/utils';
import { getCreate, patientStatusAllowedValues } from '../../models/utils';
import { ResourceDescription } from '../../models/utils/resource-description';
import { IsValue } from '../../utils/validators';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import type { SimulationEvent } from './simulation-event';

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
