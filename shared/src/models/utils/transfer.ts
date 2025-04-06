import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { getCreate } from './get-create.js';
import type { StartPoint } from './start-points.js';
import { startPointTypeOptions } from './start-points.js';

export class Transfer {
    /**
     * The timestamp in exercise time when the transfer will end.
     */
    @IsNumber()
    public readonly endTimeStamp: number;

    @ValidateNested()
    @Type(() => Object, startPointTypeOptions)
    public readonly startPoint: StartPoint;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId: UUID;

    @IsBoolean()
    public readonly isPaused: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        endTimeStamp: number,
        startPoint: StartPoint,
        targetTransferPointId: UUID,
        isPaused: boolean
    ) {
        this.endTimeStamp = endTimeStamp;
        this.startPoint = startPoint;
        this.targetTransferPointId = targetTransferPointId;
        this.isPaused = isPaused;
    }

    static readonly create = getCreate(this);
}
