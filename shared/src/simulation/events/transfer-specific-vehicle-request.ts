import { IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsLiteralUnion, IsValue } from '../../utils/validators/index.js';
import type { TransferDestination } from '../utils/transfer-destination.js';
import { transferDestinationTypeAllowedValues } from '../utils/transfer-destination.js';
import type { ExerciseOccupation } from '../../models/utils/occupations/exercise-occupation.js';
import { occupationTypeOptions } from '../../models/utils/occupations/exercise-occupation.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { SimulationEvent } from './simulation-event.js';

export class TransferSpecificVehicleRequestEvent implements SimulationEvent {
    @IsValue('transferSpecificVehicleRequestEvent')
    readonly type = 'transferSpecificVehicleRequestEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly vehicleId: UUID;

    @IsUUID(4, uuidValidationOptions)
    readonly transferInitiatingRegionId?: UUID;

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
        transferInitiatingRegionId?: UUID,
        successorOccupation?: ExerciseOccupation
    ) {
        this.vehicleId = vehicleId;
        this.transferInitiatingRegionId = transferInitiatingRegionId;
        this.transferDestinationType = transferDestinationType;
        this.transferDestinationId = transferDestinationId;
        this.successorOccupation = successorOccupation;
    }

    static readonly create = getCreate(this);
}
