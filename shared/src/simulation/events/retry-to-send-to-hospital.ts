import { IsUUID } from 'class-validator';
import {
    PatientStatus,
    getCreate,
    patientStatusAllowedValues,
} from '../../models/utils';
import { UUID } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class RetryToSendToHospitalEvent implements SimulationEvent {
    @IsValue('retryToSendToHospitalEvent')
    readonly type = 'retryToSendToHospitalEvent';

    @IsUUID()
    public readonly behaviorId: UUID;

    @IsUUID()
    public readonly transferDestinationId: UUID;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly patientCategory: PatientStatus;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        behaviorId: UUID,
        transferDestinationId: UUID,
        patientCategory: PatientStatus
    ) {
        this.behaviorId = behaviorId;
        this.transferDestinationId = transferDestinationId;
        this.patientCategory = patientCategory;
    }

    static readonly create = getCreate(this);
}
