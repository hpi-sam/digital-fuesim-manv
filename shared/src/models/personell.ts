import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import type { UUIDSet } from '../utils';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { PersonellType } from './utils';
import { Position } from './utils';

export class Personell {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public vehicleId: UUID;

    // TODO
    public personellType: PersonellType;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    public assignedPatientIds: UUIDSet;

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
        assignedPatientIds: UUIDSet
    ) {
        this.vehicleId = vehicleId;
        this.personellType = personellType;
        this.assignedPatientIds = assignedPatientIds;
    }
}
