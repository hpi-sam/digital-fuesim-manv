import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils';
import { VehicleResource } from '../utils/vehicle-resource';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class VehicleRequestRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('vehicleRequestRadiogram')
    readonly type = 'vehicleRequestRadiogram';

    @IsUUID()
    readonly simulatedRegionId: UUID;

    /**
     * @deprecated use the helpers from {@link radiogram-helpers.ts}
     * or {@link radiogram-helpers-mutable.ts} instead
     */
    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsBoolean()
    readonly informationAvailable: boolean = true;

    @Type(() => VehicleResource)
    readonly requestedVehicles: VehicleResource;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus,
        requestedVehicles: VehicleResource
    ) {
        this.id = id;
        this.simulatedRegionId = simulatedRegionId;
        this.status = status;
        this.requestedVehicles = requestedVehicles;
    }

    static readonly create = getCreate(this);
}
