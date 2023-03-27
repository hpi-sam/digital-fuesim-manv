import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import { UUID } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { IsVehicleCount } from '../../utils/validators/is-vehicle-count';
import { getCreate } from '../utils';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type VehicleCount = { [key: string]: number };

export class VehicleCountRadiogram implements Radiogram {
    @IsUUID()
    readonly id: UUID;

    @IsValue('vehicleCountRadiogram')
    readonly type = 'vehicleCountRadiogram';

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
    readonly informationAvailable: boolean = false;

    @IsVehicleCount()
    readonly vehicleCount: VehicleCount;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus
    ) {
        this.id = id;
        this.simulatedRegionId = simulatedRegionId;
        this.status = status;
        this.vehicleCount = {};
    }

    static readonly create = getCreate(this);
}
