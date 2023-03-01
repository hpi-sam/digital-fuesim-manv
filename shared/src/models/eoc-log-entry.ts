import { IsInt, IsString, IsUUID, MaxLength } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsValue } from '../utils/validators';
import { getCreate } from './utils';

export class EocLogEntry {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('eocLogEntry' as const)
    public readonly type = 'eocLogEntry';

    /**
     * The time in the exercise
     */
    @IsInt()
    public readonly exerciseTimestamp: number;

    @IsString()
    @MaxLength(65535)
    public readonly message: string;

    // Directly save the name instead of a reference to keep the name after a disconnect
    @IsString()
    @MaxLength(255)
    public readonly clientName: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        exerciseTimestamp: number,
        message: string,
        clientName: string
    ) {
        this.exerciseTimestamp = exerciseTimestamp;
        this.message = message;
        this.clientName = clientName;
    }

    static readonly create = getCreate(this);
}
