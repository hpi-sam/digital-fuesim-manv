import { IsDate, IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, ImmutableDate } from './utils';

export class EocLogEntry {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    /**
     * The "real" time
     */
    @IsDate()
    public readonly timestamp: ImmutableDate;

    /**
     * The time in the exercise
     */
    @IsDate()
    public readonly exerciseTimestamp: ImmutableDate;

    @IsString()
    public readonly message: string;

    @IsUUID(4, uuidValidationOptions)
    public readonly clientId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        timestamp: Date,
        exerciseTimestamp: Date,
        message: string,
        clientId: UUID
    ) {
        this.timestamp = timestamp;
        this.exerciseTimestamp = exerciseTimestamp;
        this.message = message;
        this.clientId = clientId;
    }

    static readonly create = getCreate(this);
}
