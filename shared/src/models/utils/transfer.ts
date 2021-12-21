import { IsNumber, IsUUID } from 'class-validator';
import type { UUID } from '../..';
import { uuidValidationOptions } from '../..';

export class Transfer {
    @IsNumber()
    public timeRemaining: number;

    @IsUUID(4, uuidValidationOptions)
    public startTransferPointId: UUID;

    @IsUUID(4, uuidValidationOptions)
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
