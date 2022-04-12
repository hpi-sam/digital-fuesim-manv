import { Type } from 'class-transformer';
import { IsDefined, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, UUIDSet, uuidValidationOptions } from '../utils';
import { CanCaterFor, getCreate, ImageProperties, Position } from './utils';

export class Material {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public vehicleId: UUID;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
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

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties = {
        url: './assets/material.svg',
        height: 40,
        aspectRatio: 1,
    };

    /**
     * @deprecated Use {@link create} instead
     */
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

    static readonly create = getCreate(this);
}
