import { IsUUID } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { PatientStatus } from '../../models/utils/patient-status.js';
import { patientStatusAllowedValues } from '../../models/utils/patient-status.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

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
