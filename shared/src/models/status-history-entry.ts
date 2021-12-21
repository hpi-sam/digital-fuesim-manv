import { IsDate, IsUUID } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';

export class StatusHistoryEntry {
    @IsUUID(4, uuidValidationOptions)
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
