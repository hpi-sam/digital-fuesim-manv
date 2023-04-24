import { IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { UUID, uuidValidationOptions } from '../../utils';
import type { SimulationEvent } from './simulation-event';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from './utils';

export class TransferPatientsRequestEvent implements SimulationEvent {
    @IsValue('transferPatientsRequestEvent')
    readonly type = 'transferPatientsRequestEvent';

    @IsString()
    readonly vehicleType: string;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID
    ) {
        this.vehicleType = vehicleType;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
    }

    static readonly create = getCreate(this);
}
