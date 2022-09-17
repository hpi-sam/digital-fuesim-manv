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
import { maxTreatmentRange } from '../state-helpers/max-treatment-range';
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
     * Patients in this range are preferred over patients that are more far away (even if they are less injured).
     * Guaranteed to be <= {@link maxTreatmentRange}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly overrideTreatmentRange: number;

    /**
     * Only patients in this range around the material's position can be treated.
     * Guaranteed to be <= {@link maxTreatmentRange}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly treatmentRange: number;

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
        this.treatmentRange = materialTemplateMap[materialType]?.treatmentRange;
        this.overrideTreatmentRange =
            materialTemplateMap[materialType]?.overrideTreatmentRange;
    }

    static readonly create = getCreate(this);

    static isInVehicle(material: Material): boolean {
        return material.position === undefined;
    }
}
