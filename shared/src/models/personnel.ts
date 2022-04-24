import { Type } from 'class-transformer';
import {
    IsDefined,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, UUIDSet, uuid, uuidValidationOptions } from '../utils';
import {
    CanCaterFor,
    Position,
    ImageProperties,
    PersonnelType,
    getCreate,
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

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties = {
        url: './assets/personnel.svg',
        height: 80,
        aspectRatio: 1,
    };

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleId: UUID,
        vehicleName: string,
        assignedPatientIds: UUIDSet,
        personnelType: PersonnelType,
        canCaterFor: CanCaterFor = CanCaterFor.create(1, 1, 4, 'or')
    ) {
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.assignedPatientIds = assignedPatientIds;
        this.personnelType = personnelType;
        this.canCaterFor = canCaterFor;
    }

    static readonly create = getCreate(this);
}
