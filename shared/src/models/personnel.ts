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
import { IsLiteralUnion, IsUUIDSet, IsValue } from '../utils/validators';
import { IsPosition } from '../utils/validators/is-position';
import type { PersonnelTemplate } from './personnel-template';
import {
    PersonnelType,
    CanCaterFor,
    ImageProperties,
    getCreate,
} from './utils';
import { Position } from './utils/position/position';
import { personnelTypeAllowedValues } from './utils/personnel-type';

export class Personnel {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('personnel' as const)
    public readonly type = 'personnel';

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    @IsLiteralUnion(personnelTypeAllowedValues)
    public readonly personnelType: PersonnelType;

    @IsString()
    public readonly vehicleName: string;

    @IsUUIDSet()
    public readonly assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public readonly canCaterFor: CanCaterFor;

    /**
     * Patients in this range are preferred over patients that are more far away (even if they are less injured).
     * Guaranteed to be <= {@link maxTreatmentRange}.
     * Setting this to `0` means deactivating this range.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly overrideTreatmentRange: number;

    /**
     * Only patients in this range around the personnel's position can be treated.
     * Guaranteed to be <= {@link maxTreatmentRange}.
     * Setting this to `0` means deactivating this range.
     */
    @IsNumber()
    @Min(0)
    @Max(maxTreatmentRange)
    public readonly treatmentRange: number;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Do not access directly, use helper methods from models/utils/position/position-helpers(-mutable) instead.
     */
    @IsPosition()
    @ValidateNested()
    public readonly position: Position;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        vehicleName: string,
        personnelType: PersonnelType,
        assignedPatientIds: UUIDSet,
        image: ImageProperties,
        canCaterFor: CanCaterFor,
        treatmentRange: number,
        overrideTreatmentRange: number,
        position: Position
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.personnelType = personnelType;
        this.assignedPatientIds = assignedPatientIds;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.treatmentRange = treatmentRange;
        this.overrideTreatmentRange = overrideTreatmentRange;
        this.position = position;
    }

    static readonly create = getCreate(this);

    static generatePersonnel(
        personnelTemplate: PersonnelTemplate,
        vehicleId: UUID,
        vehicleName: string,
        position: Position
    ): Personnel {
        return this.create(
            vehicleId,
            vehicleName,
            personnelTemplate.personnelType,
            {},
            personnelTemplate.image,
            personnelTemplate.canCaterFor,
            personnelTemplate.treatmentRange,
            personnelTemplate.overrideTreatmentRange,
            position
        );
    }
}
