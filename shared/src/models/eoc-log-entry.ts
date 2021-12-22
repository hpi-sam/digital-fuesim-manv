import { IsDate, IsString, IsUUID } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';

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
