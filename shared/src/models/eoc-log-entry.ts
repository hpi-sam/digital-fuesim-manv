import { IsDate, IsString, IsUUID } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';

export class EocLogEntry {
    @IsUUID(4, uuidValidationOptions)
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

    @IsUUID(4, uuidValidationOptions)
    public clientId: UUID;

    private constructor(
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

    static create(
        timestamp: Date,
        exerciseTimestamp: Date,
        message: string,
        clientId: UUID
    ) {
        return {
            ...new EocLogEntry(timestamp, exerciseTimestamp, message, clientId),
        };
    }
}
