import { IsDate, IsString, IsUUID } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { getCreate, ImmutableDate } from './utils';

export class StatusHistoryEntry {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    // TODO
    @IsString()
    public readonly status: 'paused' | 'running';

    /**
     * The time from which on this status was set.
     */
    @IsDate()
    public readonly startTimestamp: ImmutableDate;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(status: 'paused' | 'running', startTimestamp: Date) {
        this.status = status;
        this.startTimestamp = startTimestamp;
    }

    static readonly create = getCreate(this);
}
