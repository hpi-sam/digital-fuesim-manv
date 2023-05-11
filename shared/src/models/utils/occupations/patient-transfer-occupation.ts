import { IsUUID } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import { UUID, uuidValidationOptions } from '../../../utils';
import type { Occupation } from './occupation';

export class PatientTransferOccupation implements Occupation {
    @IsValue('patientTransferOccupation')
    readonly type = 'patientTransferOccupation';

    @IsUUID(4, uuidValidationOptions)
    readonly transportManagementRegionId: UUID;

    constructor(transportManagementRegionId: UUID) {
        this.transportManagementRegionId = transportManagementRegionId;
    }

    static readonly create = getCreate(this);
}
