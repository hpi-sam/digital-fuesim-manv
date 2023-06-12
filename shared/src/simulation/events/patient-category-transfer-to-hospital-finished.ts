import { IsBoolean } from 'class-validator';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    PatientStatus,
    patientStatusAllowedValues,
} from '../../models/utils/patient-status';
import { getCreate } from '../../models/utils/get-create';
import type { SimulationEvent } from './simulation-event';

export class PatientCategoryTransferToHospitalFinishedEvent
    implements SimulationEvent
{
    @IsValue('patientCategoryTransferToHospitalFinishedEvent')
    readonly type = 'patientCategoryTransferToHospitalFinishedEvent';

    @IsLiteralUnion(patientStatusAllowedValues)
    readonly patientCategory: PatientStatus;

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
        patientCategory: PatientStatus,
        isRelatedOnlyToOwnRegion: boolean
    ) {
        this.patientCategory = patientCategory;
        this.isRelatedOnlyToOwnRegion = isRelatedOnlyToOwnRegion;
    }

    static readonly create = getCreate(this);
}
