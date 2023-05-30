import { IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    PatientStatus,
    patientStatusAllowedValues,
} from '../../models/utils/patient-status';
import { getCreate } from '../../models/utils/get-create';
import type { SimulationEvent } from './simulation-event';

export class PatientTransferToHospitalSuccessfulEvent
    implements SimulationEvent
{
    @IsValue('patientTransferToHospitalSuccessfulEvent')
    readonly type = 'patientTransferToHospitalSuccessfulEvent';

    @IsLiteralUnion(patientStatusAllowedValues)
    readonly patientCategory: PatientStatus;

    @IsUUID(4, uuidValidationOptions)
    readonly patientOriginSimulatedRegion: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientCategory: PatientStatus,
        patienrOriginSimulatedRegion: UUID
    ) {
        this.patientCategory = patientCategory;
        this.patientOriginSimulatedRegion = patienrOriginSimulatedRegion;
    }

    static readonly create = getCreate(this);
}
