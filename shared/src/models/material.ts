import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { materialTemplateMap } from '../data/default-state/material-templates';
import { uuid, UUID, UUIDSet, uuidValidationOptions } from '../utils';
import { CanCaterFor, getCreate, ImageProperties, Position } from './utils';
import type { MaterialType } from './utils/material-type';

export class Material {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    @IsString()
    public readonly vehicleName: string;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    @IsNumber()
    @Min(0)
    public readonly specificThreshold: number;

    @IsNumber()
    @Min(0)
    public readonly generalThreshold: number;

    @IsBoolean()
    public readonly auraMode: boolean;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        vehicleName: string,
        materialType: MaterialType,
        assignedPatientIds: UUIDSet,
        position?: Position
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.assignedPatientIds = assignedPatientIds;
        this.position = position;
        this.image = materialTemplateMap[materialType]?.image;
        this.canCaterFor = materialTemplateMap[materialType]?.canCaterFor;
        this.generalThreshold =
            materialTemplateMap[materialType]?.generalThreshold;
        this.specificThreshold =
            materialTemplateMap[materialType]?.specificThreshold;
        this.auraMode = materialTemplateMap[materialType]?.auraMode;
    }

    static readonly create = getCreate(this);

    static isInVehicle(material: Material): boolean {
        return material.position === undefined;
    }
}
