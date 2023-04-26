import { IsOptional, IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { ResourceDescription } from '../../models/utils/resource-description';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import { UUID, uuidValidationOptions } from '../../utils';
import type { SimulationEvent } from './simulation-event';

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
