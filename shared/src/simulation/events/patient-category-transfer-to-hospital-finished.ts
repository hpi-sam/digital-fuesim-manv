import { IsBoolean } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    AlivePatientTriageCategory,
    alivePatientTriageCategoryAllowedValues,
} from '../utils/alive-patient-triage-category';
import type { SimulationEvent } from './simulation-event';

export class PatientCategoryTransferToHospitalFinishedEvent
    implements SimulationEvent
{
    @IsValue('patientCategoryTransferToHospitalFinishedEvent')
    readonly type = 'patientCategoryTransferToHospitalFinishedEvent';

    @IsLiteralUnion(alivePatientTriageCategoryAllowedValues)
    readonly patientCategory: AlivePatientTriageCategory;

    /**
     * This is true, if this refers to its own one single region.
     * This is false, if it refers to all regions managed by one behavior.
     */
    @IsBoolean()
    readonly isRelatedToOwnRegion: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientCategory: AlivePatientTriageCategory,
        originSimulatedRegion: boolean
    ) {
        this.patientCategory = patientCategory;
        this.isRelatedToOwnRegion = originSimulatedRegion;
    }

    static readonly create = getCreate(this);
}
