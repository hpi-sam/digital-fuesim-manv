import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import {
    ExerciseOccupation,
    getCreate,
    occupationTypeOptions,
} from '../../models/utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { ResourceDescription } from '../../models/utils/resource-description';
import { IsResourceDescription } from '../../utils/validators/is-resource-description';
import { UUID, uuidValidationOptions } from '../../utils';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import type { SimulationEvent } from './simulation-event';

export class TransferVehiclesRequestEvent implements SimulationEvent {
    @IsValue('transferVehiclesRequestEvent')
    readonly type = 'transferVehiclesRequestEvent';

    @IsResourceDescription()
    readonly requestedVehicles: ResourceDescription;

    @IsLiteralUnion(transferDestinationTypeAllowedValues)
    readonly transferDestinationType: TransferDestination;

    @IsUUID(4, uuidValidationOptions)
    readonly transferDestinationId: UUID;

    @IsOptional()
    @Type(...occupationTypeOptions)
    readonly successorOccupation?: ExerciseOccupation;

    @IsOptional()
    @IsString()
    readonly key?: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        requestedVehicles: ResourceDescription,
        transferDestinationType: TransferDestination,
        transferDestinationId: UUID,
        key?: string,
        successorOccupation?: ExerciseOccupation
    ) {
        this.requestedVehicles = requestedVehicles;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.key = key;
        this.successorOccupation = successorOccupation;
    }

    static readonly create = getCreate(this);
}
