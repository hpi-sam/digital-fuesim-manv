import { IsBoolean, IsDefined, IsNumber, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';
import type { AlarmGroupStartPoint, TransferStartPoint } from './start-points';

export class Transfer {
    /**
     * The timestamp in exercise time when the transfer will end.
     */
    @IsNumber()
    public readonly endTimeStamp: number;

    @IsDefined()
    public readonly startPoint: AlarmGroupStartPoint | TransferStartPoint;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId: UUID;

    @IsBoolean()
    public readonly isPaused: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        endTimeStamp: number,
        startPoint: AlarmGroupStartPoint | TransferStartPoint,
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
