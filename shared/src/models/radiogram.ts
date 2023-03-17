import { IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { IsLiteralUnion, IsValue } from '../utils/validators';
import { IsRadiogramStatus } from '../utils/validators/is-radiogram-status';
import { getCreate } from './utils';
import { RadiogramStatus } from './utils/radiogram-status/radiogram-status';
import {
    RadiogramType,
    radiogramTypeAllowedValues,
} from './utils/radiogram-type';

export class Radiogram {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('radiogram' as const)
    public readonly type = 'radiogram';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId: UUID;

    @IsInt()
    @Min(0)
    public readonly timestamp: number;

    @IsLiteralUnion(radiogramTypeAllowedValues)
    public readonly radiogramType: RadiogramType;

    @IsRadiogramStatus()
    @ValidateNested()
    public readonly radiogramStatus: RadiogramStatus;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        simulatedRegionId: UUID,
        timestamp: number,
        radiogramType: RadiogramType,
        radiogramStatus: RadiogramStatus
    ) {
        this.simulatedRegionId = simulatedRegionId;
        this.timestamp = timestamp;
        this.radiogramType = radiogramType;
        this.radiogramStatus = radiogramStatus;
    }

    static readonly create = getCreate(this);
}
