import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { IsRadiogramStatus } from '../../utils/validators/is-radiogram-status';
import { getCreate } from '../utils/get-create';
import { VehicleResource } from '../utils/rescue-resource';
import type { Radiogram } from './radiogram';
import { ExerciseRadiogramStatus } from './status/exercise-radiogram-status';

export class ResourceRequestRadiogram implements Radiogram {
    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @IsValue('resourceRequestRadiogram')
    readonly type = 'resourceRequestRadiogram';

    @IsUUID(4, uuidValidationOptions)
    readonly simulatedRegionId: UUID;

    /**
     * @deprecated use the helpers from {@link radiogram-helpers.ts}
     * or {@link radiogram-helpers-mutable.ts} instead
     */
    @IsRadiogramStatus()
    @ValidateNested()
    readonly status: ExerciseRadiogramStatus;

    @IsOptional()
    @IsBoolean()
    readonly resourcesPromised?: boolean;

    @IsBoolean()
    readonly informationAvailable: boolean = true;

    @Type(() => VehicleResource)
    @ValidateNested()
    readonly requiredResource: VehicleResource;

    @IsString()
    readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus,
        requiredResource: VehicleResource,
        key: string
    ) {
        this.id = id;
        this.simulatedRegionId = simulatedRegionId;
        this.status = status;
        this.requiredResource = requiredResource;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
