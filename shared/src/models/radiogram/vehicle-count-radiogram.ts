import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status.js';
import { IsVehicleCount } from '../../utils/validators/is-vehicle-count.js';
import { getCreate } from '../utils/get-create.js';
import type { Radiogram } from './radiogram.js';
import type { ExerciseRadiogramStatus } from './status/exercise-radiogram-status.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type VehicleCount = { [key: string]: number };

export class VehicleCountRadiogram implements Radiogram {
    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @IsValue('vehicleCountRadiogram')
    readonly type = 'vehicleCountRadiogram';

    @IsUUID(4, uuidValidationOptions)
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
