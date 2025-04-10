import { IsUUID } from 'class-validator';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import type { UUID } from '../../../utils/index.js';
import { uuidValidationOptions } from '../../../utils/index.js';
import type { Occupation } from './occupation.js';

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
