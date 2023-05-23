import { IsUUID } from 'class-validator';
import {
    PatientStatus,
    getCreate,
    patientStatusAllowedValues,
} from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
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
