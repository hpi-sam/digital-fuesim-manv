import { IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDArrayValidationOptions, UUIDSet, UUIDValidationOptions } from '../utils';
import { PersonellType, Position } from './utils';

export class Personell {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, UUIDValidationOptions)
    public vehicleId: UUID;

    // TODO
    public personellType: PersonellType;

    @IsUUID(4, UUIDArrayValidationOptions) // TODO: does this work on this kind of sets?
    public assignedPatientIds: UUIDSet;

    /**
     * if undefined, is in vehicle with {@link vehicleId}
     */
    @ValidateNested()
    public position?: Position;

    constructor(
        vehicleId: UUID,
        personellType: PersonellType,
        assignedPatientIds: UUIDSet
    ) {
        this.vehicleId = vehicleId;
        this.personellType = personellType;
        this.assignedPatientIds = assignedPatientIds;
    }
}
