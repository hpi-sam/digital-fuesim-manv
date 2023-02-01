import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { maxTreatmentRange } from '../state-helpers/max-treatment-range';
import { uuidValidationOptions, UUID, uuid, UUIDSet } from '../utils';
import { IsUUIDSet, IsValue } from '../utils/validators';
import { IsPosition } from '../utils/validators/is-position';
import type { MaterialTemplate } from './material-template';
import { CanCaterFor, ImageProperties, getCreate } from './utils';
import { Position } from './utils/position/position';

export class Material {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('material' as const)
    public readonly type = 'material';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    @IsString()
    public readonly vehicleName: string;

    @IsUUIDSet()
    public readonly assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    /**
     * Patients in this range are preferred over patients farther away (even if they are less injured).
     * Guaranteed to be <= {@link maxTreatmentRange}.
     * Setting this to `0` means deactivating this range.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly overrideTreatmentRange: number;

    /**
     * Only patients in this range around the material's position can be treated.
     * Guaranteed to be <= {@link maxTreatmentRange}.
     * Setting this to `0` means deactivating this range.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly treatmentRange: number;

    /**
     * @deprecated Do not access directly, use helper methods from models/utils/position/position-helpers(-mutable) instead.
     */
    @IsPosition()
    @ValidateNested()
    public readonly position: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        vehicleName: string,
        assignedPatientIds: UUIDSet,
        image: ImageProperties,
        canCaterFor: CanCaterFor,
        treatmentRange: number,
        overrideTreatmentRange: number,
        position: Position
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.assignedPatientIds = assignedPatientIds;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.treatmentRange = treatmentRange;
        this.overrideTreatmentRange = overrideTreatmentRange;
        this.position = position;
    }

    static readonly create = getCreate(this);

    static generateMaterial(
        materialTemplate: MaterialTemplate,
        vehicleId: UUID,
        vehicleName: string,
        position: Position
    ): Material {
        return this.create(
            vehicleId,
            vehicleName,
            {},
            materialTemplate.image,
            materialTemplate.canCaterFor,
            materialTemplate.treatmentRange,
            materialTemplate.overrideTreatmentRange,
            position
        );
    }
}
