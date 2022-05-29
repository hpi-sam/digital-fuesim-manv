import { IsDefined, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { uuid, uuidValidationOptions, UUID, UUIDSet } from '../utils';
import { getCreate } from './utils';

export class Hospital {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    /**
     * The time in ms it takes to transport a patient to this hospital
     */
    @IsNumber()
    @Min(0)
    readonly transportDuration: number = 0;

    /**
     * These Ids reference a hospitalPatients patientId
     */
    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly patientIds: UUIDSet = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string, transportDuration: number) {
        this.name = name;
        this.transportDuration = transportDuration;
    }

    static readonly create = getCreate(this);
}
