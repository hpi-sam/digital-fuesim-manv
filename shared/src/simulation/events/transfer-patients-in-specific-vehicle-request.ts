import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID, UUIDSet } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import {
    IsLiteralUnion,
    IsUUIDSet,
    IsValue,
} from '../../utils/validators/index.js';
import type { TransferDestination } from '../utils/transfer-destination.js';
import { transferDestinationTypeAllowedValues } from '../utils/transfer-destination.js';
import type { SimulationEvent } from './simulation-event.js';

export class TransferPatientsInSpecificVehicleRequestEvent
    implements SimulationEvent
{
    @IsValue('transferPatientsInSpecificVehicleRequestEvent')
    readonly type = 'transferPatientsInSpecificVehicleRequestEvent';

    @IsUUIDSet()
    readonly patientIds: UUIDSet;

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

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
        patientIds: UUIDSet,
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        transferInitiatingRegionId?: UUID
    ) {
        this.patientIds = patientIds;
        this.vehicleId = vehicleId;
        this.transferInitiatingRegionId = transferInitiatingRegionId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
    }

    static readonly create = getCreate(this);
}
