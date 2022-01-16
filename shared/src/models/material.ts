import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import {
    uuid,
    UUID,
    UUIDSet,
    uuidArrayValidationOptions,
    uuidValidationOptions,
} from '../utils';
import { CanCaterFor, Position } from './utils';

export class Material {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public vehicleId: UUID;

    @IsUUID(4, uuidArrayValidationOptions) // TODO: does this work on this kind of sets?
    public assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public canCaterFor: CanCaterFor;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public position?: Position;

    constructor(
        vehicleId: UUID,
        assignedPatientIds: UUIDSet,
        canCaterFor: CanCaterFor,
        position?: Position
    ) {
        this.vehicleId = vehicleId;
        this.assignedPatientIds = assignedPatientIds;
        this.canCaterFor = canCaterFor;
        this.position = position;
    }
}
