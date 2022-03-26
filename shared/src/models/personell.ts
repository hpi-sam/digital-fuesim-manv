import { Type } from 'class-transformer';
import {
    IsDefined,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, UUIDSet, uuid, uuidValidationOptions } from '../utils';
import { CanCaterFor, Position, ImageProperties, PersonellType } from './utils';

export class Personell {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public vehicleId: UUID;

    // TODO
    @IsString()
    public personellType: PersonellType;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public assignedPatientIds: UUIDSet;

    @ValidateNested()
    @Type(() => CanCaterFor)
    public canCaterFor: CanCaterFor;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties = {
        url: './assets/personell.png',
        height: 80,
        aspectRatio: 1,
    };

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public position?: Position;

    constructor(
        vehicleId: UUID,
        personellType: PersonellType,
        assignedPatientIds: UUIDSet,
        canCaterFor: CanCaterFor = new CanCaterFor(1, 1, 4, 'or')
    ) {
        this.vehicleId = vehicleId;
        this.personellType = personellType;
        this.assignedPatientIds = assignedPatientIds;
        this.canCaterFor = canCaterFor;
    }
}
