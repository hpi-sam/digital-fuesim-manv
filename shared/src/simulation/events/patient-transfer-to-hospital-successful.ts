import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    AlivePatientTriageCategory,
    alivePatientTriageCategoryAllowedValues,
} from '../utils/alive-patient-triage-category';
import type { SimulationEvent } from './simulation-event';

export class PatientTransferToHospitalSuccessfulEvent
    implements SimulationEvent
{
    @IsValue('patientTransferToHospitalSuccessfulEvent')
    readonly type = 'patientTransferToHospitalSuccessfulEvent';

    @IsLiteralUnion(alivePatientTriageCategoryAllowedValues)
    readonly patientCategory: AlivePatientTriageCategory;

    @IsUUID(4, uuidValidationOptions)
    readonly originSimulatedRegion: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientCategory: AlivePatientTriageCategory,
        originSimulatedRegion: UUID
    ) {
        this.patientCategory = patientCategory;
        this.originSimulatedRegion = originSimulatedRegion;
    }

    static readonly create = getCreate(this);
}
