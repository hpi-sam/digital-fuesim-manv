import { IsOptional, IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { ResourceDescription } from '../../models/utils/resource-description.js';
import { IsResourceDescription } from '../../utils/validators/is-resource-description.js';
import type { TransferDestination } from '../utils/transfer-destination.js';
import { transferDestinationTypeAllowedValues } from '../utils/transfer-destination.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import type { SimulationEvent } from './simulation-event.js';

export class RequestReceivedEvent implements SimulationEvent {
    @IsValue('requestReceivedEvent')
    readonly type = 'requestReceivedEvent';

    @IsResourceDescription()
    readonly availableVehicles: ResourceDescription;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsString()
    @IsOptional()
    readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        availableVehicles: ResourceDescription,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        key?: string
    ) {
        this.availableVehicles = availableVehicles;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
