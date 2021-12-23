import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { PatientStatus } from './utils';
import { Position } from './utils';

export class Patient {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    // TODO: any can't be validated
    public personalInformation: any;

    // TODO
    public visibleStatus: PatientStatus | null;

    // TODO
    public realStatus: PatientStatus;

    // TODO: this was Date
    public nextPhaseChange: string;

    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        personalInformation: any,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        nextPhaseChange: string
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.nextPhaseChange = nextPhaseChange;
    }

    /**
     * Exclusive-or to {@link vehicleId}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public position?: Position;
    /**
     * Exclusive-or to {@link position}
     */
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public vehicleId?: UUID;
}
