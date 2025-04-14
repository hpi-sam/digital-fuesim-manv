import { IsNumber, IsString, IsUUID, Min } from 'class-validator';
import type { UUID, UUIDSet } from '../utils/index.js';
import { uuid, uuidValidationOptions } from '../utils/index.js';
import { IsUUIDSet, IsValue } from '../utils/validators/index.js';
import { getCreate } from './utils/index.js';

export class Hospital {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('hospital' as const)
    public readonly type = 'hospital';

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
    @IsUUIDSet()
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
