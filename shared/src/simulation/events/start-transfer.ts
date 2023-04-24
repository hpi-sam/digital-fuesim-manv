import { IsOptional, IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from './utils';

export class StartTransferEvent implements SimulationEvent {
    @IsValue('startTransferEvent')
    readonly type = 'startTransferEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId!: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsOptional()
    @IsString()
    readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        key?: string
    ) {
        this.vehicleId = vehicleId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
