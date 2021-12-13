import { IsDate, IsString, IsUUID } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';

export class EocLogEntry {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    /**
     * The "real" time
     */
    @IsDate()
    public timestamp: Date;

    /**
     * The time in the exercise
     */
    @IsDate()
    public exerciseTimestamp: Date;

    @IsString()
    public message: string;

    @IsUUID(4, UUIDValidationOptions)
    public clientId: UUID;

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
}
