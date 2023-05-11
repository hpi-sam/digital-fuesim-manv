import { IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import {
    ExerciseOccupation,
    getCreate,
    occupationTypeOptions,
} from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import type { SimulationEvent } from './simulation-event';

export class TransferSpecificVehicleRequestEvent implements SimulationEvent {
    @IsValue('transferSpecificVehicleRequestEvent')
    readonly type = 'transferSpecificVehicleRequestEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsOptional()
    @Type(...occupationTypeOptions)
    readonly successorOccupation?: ExerciseOccupation;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        successorOccupation?: ExerciseOccupation
    ) {
        this.vehicleId = vehicleId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.successorOccupation = successorOccupation;
    }

    static readonly create = getCreate(this);
}
