import { IsNumber, IsUUID } from 'class-validator';
import { UUID, UUIDValidationOptions } from '../..';

export class Transfer {
    @IsNumber()
    public timeRemaining: number;

    @IsUUID(4, UUIDValidationOptions)
    public startTransferPointId: UUID;

    @IsUUID(4, UUIDValidationOptions)
    public targetTransferPointId: UUID;

    public constructor(
        timeRemaining: number,
        startTransferPointId: UUID,
        targetTransferPointId: UUID
    ) {
        this.timeRemaining = timeRemaining;
        this.startTransferPointId = startTransferPointId;
        this.targetTransferPointId = targetTransferPointId;
    }
}
