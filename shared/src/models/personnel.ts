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
import { maxTreatmentRange } from '../state-helpers/max-treatment-range';
import { UUID, UUIDSet, uuid, uuidValidationOptions } from '../utils';
import type { PersonnelTemplate } from './personnel-template';
import {
    CanCaterFor,
    Position,
    ImageProperties,
    PersonnelType,
    getCreate,
    Transfer,
} from './utils';

export class Personnel {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly vehicleId: UUID;

    // TODO
    @IsString()
    public readonly personnelType: PersonnelType;

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
     * If undefined, the personnel is either in the vehicle with {@link this.vehicleId} or in transfer.
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
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
        image: any,
        canCaterFor: CanCaterFor,
        treatmentRange: any,
        overrideTreatmentRange: any,
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
    }

    static readonly create = getCreate(this);

    static generatePersonnel(
        personnelTemplate: PersonnelTemplate,
        vehicleId: UUID,
        vehicleName: string
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
            undefined
        );
    }

    static isInVehicle(personnel: Personnel): boolean {
        return (
            personnel.position === undefined && personnel.transfer === undefined
        );
    }
}
