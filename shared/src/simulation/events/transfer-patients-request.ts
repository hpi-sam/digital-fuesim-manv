import { IsString, IsUUID } from 'class-validator';
import { getCreate } from '../../models/utils';
import { IsLiteralUnion, IsUUIDSet, IsValue } from '../../utils/validators';
import { UUID, UUIDSet, uuidValidationOptions } from '../../utils';
import {
    TransferDestination,
    transferDestinationTypeAllowedValues,
} from '../utils/transfer-destination';
import type { SimulationEvent } from './simulation-event';

export class TransferPatientsRequestEvent implements SimulationEvent {
    @IsValue('transferPatientsRequestEvent')
    readonly type = 'transferPatientsRequestEvent';

    @IsString()
    readonly vehicleType: string;

    @IsUUIDSet()
    readonly patientIds: UUIDSet;

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
        transferDestinationId: UUID
    ) {
        this.vehicleType = vehicleType;
        this.patientIds = patientIds;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
    }

    static readonly create = getCreate(this);
}
