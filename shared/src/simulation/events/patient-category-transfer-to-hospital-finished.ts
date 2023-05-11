import { IsBoolean } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    RelevantForHospitalTransportPatientCategory,
    relevantForHospitalTransportPatientCategoryAllowedValues,
} from '../utils/relevant-for-hospital-transport-patient-category';
import type { SimulationEvent } from './simulation-event';

export class PatientCategoryTransferToHospitalFinishedEvent
    implements SimulationEvent
{
    @IsValue('patientCategoryTransferToHospitalFinishedEvent')
    readonly type = 'patientCategoryTransferToHospitalFinishedEvent';

    @IsLiteralUnion(relevantForHospitalTransportPatientCategoryAllowedValues)
    readonly patientCategory: RelevantForHospitalTransportPatientCategory;

    /**
     * This is true, if this refers to its own one single region.
     * This is false, if it refers to all regions managed by one behavior.
     */
    @IsBoolean()
    readonly isRelatedOnlyToOwnRegion: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientCategory: RelevantForHospitalTransportPatientCategory,
        isRelatedOnlyToOwnRegion: boolean
    ) {
        this.patientCategory = patientCategory;
        this.isRelatedOnlyToOwnRegion = isRelatedOnlyToOwnRegion;
    }

    static readonly create = getCreate(this);
}
