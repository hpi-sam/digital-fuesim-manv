import { IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from './utils';

export class TransferSpecificVehicleRequestEvent implements SimulationEvent {
    @IsValue('transferSpecificVehicleRequestEvent')
    readonly type = 'transferSpecificVehicleRequestEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID
    ) {
        this.vehicleId = vehicleId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
    }

    static readonly create = getCreate(this);
}
