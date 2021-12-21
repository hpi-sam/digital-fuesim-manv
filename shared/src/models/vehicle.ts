import {
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import type { UUID, UUIDSet } from '../utils';
import {
    uuid,
    uuidArrayValidationOptions,
    uuidValidationOptions,
} from '../utils';
import type { Position, Transfer } from './utils';

export class Vehicle {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public materialId: UUID;

    @IsNumber()
    public patientCapacity: number;

    @IsString()
    public name: string;

    /**
     * Exclusive-or to {@link transfer}
     */
    @ValidateNested()
    @IsOptional()
    public position?: Position;

    /**
     * Exclusive-or to {@link position}
     */
    @ValidateNested()
    @IsOptional()
    public transfer?: Transfer;

    @IsUUID(4, uuidArrayValidationOptions) // TODO: does this work on this kind of sets?
    public personellIds: UUIDSet = {};

    @IsUUID(4, uuidArrayValidationOptions) // TODO: does this work on this kind of sets?
    public patientIds: UUIDSet = {};

    constructor(materialId: UUID, patientCapacity: number, name: string) {
        this.materialId = materialId;
        this.patientCapacity = patientCapacity;
        this.name = name;
    }
}
