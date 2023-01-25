import { Type } from 'class-transformer';
import {
    IsUUID,
    IsString,
    ValidateNested,
    IsNumber,
    Min,
    Max,
    IsOptional,
} from 'class-validator';
import { maxTreatmentRange } from '../state-helpers/max-treatment-range';
import { uuidValidationOptions, UUID, uuid, UUIDSet } from '../utils';
import { IsLiteralUnion, IsUUIDSet } from '../utils/validators';
import { IsMetaPosition } from '../utils/validators/is-metaposition';
import type { PersonnelTemplate } from './personnel-template';
import {
    PersonnelType,
    CanCaterFor,
    ImageProperties,
    Position,
    Transfer,
    getCreate,
} from './utils';
import { MetaPosition } from './utils/meta-position';
import { personnelTypeAllowedValues } from './utils/personnel-type';

export class Personnel {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

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

    @IsMetaPosition()
    @ValidateNested()
    public readonly metaPosition: MetaPosition;

    /**
     * @deprecated use {@link metaPosition}
     * If undefined, the personnel is either in the vehicle with {@link this.vehicleId} or in transfer.
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * * @deprecated use {@link metaPosition}
     * If undefined, the personnel is either in the vehicle with {@link this.vehicleId} or has a {@link position}.
     */
    @ValidateNested()
    @Type(() => Transfer)
    @IsOptional()
    public readonly transfer?: Transfer;

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
        metaPosition: MetaPosition,
        position?: Position
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.personnelType = personnelType;
        this.assignedPatientIds = assignedPatientIds;
        this.position = position;
        this.image = image;
        this.canCaterFor = canCaterFor;
        this.treatmentRange = treatmentRange;
        this.overrideTreatmentRange = overrideTreatmentRange;
        this.metaPosition = metaPosition;
    }

    static readonly create = getCreate(this);

    static generatePersonnel(
        personnelTemplate: PersonnelTemplate,
        vehicleId: UUID,
        vehicleName: string,
        metaPosition: MetaPosition
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
            metaPosition,
            undefined
        );
    }

    static isInVehicle(personnel: Personnel): boolean {
        return personnel.metaPosition.type === 'vehicle';
    }
}
