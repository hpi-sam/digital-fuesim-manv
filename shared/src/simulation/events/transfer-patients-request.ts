import { IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import {
    IsLiteralUnion,
    IsUUIDSet,
    IsValue,
} from '../../utils/validators/index.js';
import type { UUID, UUIDSet } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import type { TransferDestination } from '../utils/transfer-destination.js';
import { transferDestinationTypeAllowedValues } from '../utils/transfer-destination.js';
import type { SimulationEvent } from './simulation-event.js';

export class TransferPatientsRequestEvent implements SimulationEvent {
    @IsValue('transferPatientsRequestEvent')
    readonly type = 'transferPatientsRequestEvent';

    @IsString()
    readonly vehicleType: string;

    @IsUUIDSet()
    readonly patientIds: UUIDSet;

    @IsUUID(4, uuidValidationOptions)
    readonly transferInitiatingRegionId?: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        patientIds: UUIDSet,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        transferInitiatingRegionId?: UUID
    ) {
        this.vehicleType = vehicleType;
        this.patientIds = patientIds;
        this.transferInitiatingRegionId = transferInitiatingRegionId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
    }

    static readonly create = getCreate(this);
}
