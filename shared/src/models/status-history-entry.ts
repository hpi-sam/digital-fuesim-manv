import { IsDate, IsUUID } from 'class-validator';
import { uuid, UUID, UUIDValidationOptions } from '../utils';

export class StatusHistoryEntry {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    // TODO
    public status: 'paused' | 'running';

    /**
     * The time from which on this status was set.
     */
    @IsDate()
    public startTimestamp: Date;

    constructor(status: 'paused' | 'running', startTimestamp: Date) {
        this.status = status;
        this.startTimestamp = startTimestamp;
    }
}
