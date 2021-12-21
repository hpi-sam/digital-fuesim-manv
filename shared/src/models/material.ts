import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import type { UUID, UUIDSet } from '../utils';
import {
    uuid,
    uuidArrayValidationOptions,
    uuidValidationOptions,
} from '../utils';
import type { CanCaterFor, Position } from './utils';

export class Material {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public vehicleId: UUID;

    @IsUUID(4, uuidArrayValidationOptions) // TODO: does this work on this kind of sets?
    public assignedPatientIds: UUIDSet;

    @ValidateNested()
    public canCaterFor: CanCaterFor;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
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
