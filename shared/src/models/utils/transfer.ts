import { IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';
import { getCreate } from './get-create';

export class Transfer {
    /**
     * The timestamp in exercise time when the transfer will end.
     */
    @IsNumber()
    public readonly endTimeStamp: number;

    @IsUUID(4, uuidValidationOptions)
    public readonly startTransferPointId: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetTransferPointId: UUID;

    @IsBoolean()
    public readonly isPaused: boolean;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        endTimeStamp: number,
        startTransferPointId: UUID,
        targetTransferPointId: UUID,
        isPaused: boolean
    ) {
        this.endTimeStamp = endTimeStamp;
        this.startTransferPointId = startTransferPointId;
        this.targetTransferPointId = targetTransferPointId;
        this.isPaused = isPaused;
    }

    static readonly create = getCreate(this);
}
