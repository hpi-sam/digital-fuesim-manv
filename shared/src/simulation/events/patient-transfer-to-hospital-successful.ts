import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    RelevantForHospitalTransportPatientCategory,
    relevantForHospitalTransportPatientCategoryAllowedValues,
} from '../utils/relevant-for-hospital-transport-patient-category';
import type { SimulationEvent } from './simulation-event';

export class PatientTransferToHospitalSuccessfulEvent
    implements SimulationEvent
{
    @IsValue('patientTransferToHospitalSuccessfulEvent')
    readonly type = 'patientTransferToHospitalSuccessfulEvent';

    @IsLiteralUnion(relevantForHospitalTransportPatientCategoryAllowedValues)
    readonly patientCategory: RelevantForHospitalTransportPatientCategory;

    @IsUUID(4, uuidValidationOptions)
    readonly patientOriginSimulatedRegion: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientCategory: RelevantForHospitalTransportPatientCategory,
        patienrOriginSimulatedRegion: UUID
    ) {
        this.patientCategory = patientCategory;
        this.patientOriginSimulatedRegion = patienrOriginSimulatedRegion;
    }

    static readonly create = getCreate(this);
}
