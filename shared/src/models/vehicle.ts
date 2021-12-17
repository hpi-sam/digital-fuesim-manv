import { IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import {
    UUID,
    uuid,
    UUIDArrayValidationOptions,
    UUIDSet,
    UUIDValidationOptions,
} from '../utils';
import { Position, Transfer } from './utils';

export class Vehicle {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, UUIDValidationOptions)
    public materialId: UUID;

    @IsNumber()
    public patientCapacity: number;

    @IsString()
    public name: string;

    /**
     * Exclusive-or to {@link transfer}
     */
    @ValidateNested()
    public position?: Position;

    /**
     * Exclusive-or to {@link position}
     */
    @ValidateNested()
    public transfer?: Transfer;

    @IsUUID(4, UUIDArrayValidationOptions) // TODO: does this work on this kind of sets?
    public personellIds: UUIDSet = {};

    @IsUUID(4, UUIDArrayValidationOptions) // TODO: does this work on this kind of sets?
    public patientIds: UUIDSet = {};

    constructor(materialId: UUID, patientCapacity: number, name: string) {
        this.materialId = materialId;
        this.patientCapacity = patientCapacity;
        this.name = name;
    }
}
