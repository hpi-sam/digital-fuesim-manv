import { IsDate, IsString, IsUUID } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { getCreate } from './utils';

export class StatusHistoryEntry {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    // TODO
    @IsString()
    public status: 'paused' | 'running';

    /**
     * The time from which on this status was set.
     */
    @IsDate()
    public startTimestamp: Date;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(status: 'paused' | 'running', startTimestamp: Date) {
        this.status = status;
        this.startTimestamp = startTimestamp;
    }

    static readonly create = getCreate(this);
}
