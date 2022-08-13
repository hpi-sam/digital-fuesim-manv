import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { personnelTemplateMap } from '../data/default-state/personnel-templates';
import { maxGlobalThreshold } from '../state-helpers/max-global-threshold';
import { UUID, UUIDSet, uuid, uuidValidationOptions } from '../utils';
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
     * Guaranteed to be <= {@link maxGlobalThreshold}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxGlobalThreshold)
    public readonly specificThreshold: number;

    /**
     * Guaranteed to be <= {@link maxGlobalThreshold}.
     */
    @IsNumber()
    @Min(0)
    @Max(maxGlobalThreshold)
    public readonly generalThreshold: number;

    @IsBoolean()
    public readonly auraMode: boolean;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * if undefined, is in vehicle with {@link this.vehicleId} or in transfer
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * Exclusive-or to {@link position}
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
        assignedPatientIds: UUIDSet
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.personnelType = personnelType;
        this.assignedPatientIds = assignedPatientIds;
        // The constructor must be callable without any arguments
        this.image = personnelTemplateMap[personnelType]?.image;
        this.canCaterFor = personnelTemplateMap[personnelType]?.canCaterFor;
        this.generalThreshold =
            personnelTemplateMap[personnelType]?.generalThreshold;
        this.specificThreshold =
            personnelTemplateMap[personnelType]?.specificThreshold;
        this.auraMode = personnelTemplateMap[personnelType]?.auraMode;
    }

    static readonly create = getCreate(this);

    static isInVehicle(personnel: Personnel): boolean {
        return (
            personnel.position === undefined && personnel.transfer === undefined
        );
    }
}
