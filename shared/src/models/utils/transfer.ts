import { IsNumber, IsUUID } from 'class-validator';
import { UUID, uuidValidationOptions } from '../../utils';

export class Transfer {
    /**
     * The timestamp in exercise time when the transfer will end.
     */
    @IsNumber()
    public endTimeStamp: number;

    @IsUUID(4, uuidValidationOptions)
    public startTransferPointId: UUID;

    @IsUUID(4, uuidValidationOptions)
    public targetTransferPointId: UUID;

    public constructor(
        endTimeStamp: number,
        startTransferPointId: UUID,
        targetTransferPointId: UUID
    ) {
        this.endTimeStamp = endTimeStamp;
        this.startTransferPointId = startTransferPointId;
        this.targetTransferPointId = targetTransferPointId;
    }
}
