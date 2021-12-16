import { IsDate, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { PatientStatus, Position } from './utils';

export class Patient {
    @IsUUID(4, UUIDValidationOptions)
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
    public position?: Position;

    // TODO: how to make this vaidator optional?
    /**
     * Exclusive-or to {@link position}
     */
    @IsUUID(4, UUIDValidationOptions)
    public vehicleId?: UUID;
}
