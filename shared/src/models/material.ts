import { IsUUID, ValidateNested } from 'class-validator';
import {
    UUID,
    uuid,
    UUIDArrayValidationOptions,
    UUIDSet,
    UUIDValidationOptions,
} from '../utils';
import { CanCaterFor, Position } from './utils';

export class Material {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, UUIDValidationOptions)
    public vehicleId: UUID;

    @IsUUID(4, UUIDArrayValidationOptions) // TODO: does this work on this kind of sets?
    public assignedPatientIds: UUIDSet;

    @ValidateNested()
    public canCaterFor: CanCaterFor;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
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
