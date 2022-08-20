import { Type } from 'class-transformer';
import {
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { materialTemplateMap } from '../data/default-state/material-templates';
import { maxGlobalThreshold } from '../state-helpers/max-global-threshold';
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

    /**
     * Guaranteed to be <= {@link maxGlobalThreshold}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxGlobalThreshold)
    // TODO: rename to overrideTreatmentThreshold
    public readonly specificThreshold: number;

    /**
     * Guaranteed to be <= {@link maxGlobalThreshold}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxGlobalThreshold)
    // TODO: rename to treatmentThreshold
    public readonly generalThreshold: number;

    /**
     * if undefined, is in vehicle with {@link this.vehicleId}
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
        // The constructor must be callable without any arguments
        this.image = materialTemplateMap[materialType]?.image;
        this.canCaterFor = materialTemplateMap[materialType]?.canCaterFor;
        this.generalThreshold =
            materialTemplateMap[materialType]?.generalThreshold;
        this.specificThreshold =
            materialTemplateMap[materialType]?.specificThreshold;
    }

    static readonly create = getCreate(this);

    static isInVehicle(material: Material): boolean {
        return material.position === undefined;
    }
}
