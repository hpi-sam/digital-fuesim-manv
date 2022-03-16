import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import type { PatientHealthState, PatientStatus } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { PersonalInformation } from './utils/personal-information';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public personalInformation: PersonalInformation;

    public visibleStatus: PatientStatus | null;

    public realStatus: PatientStatus;

    @IsString()
    public imageUrl: string;

    public healthStates: { [stateId: UUID]: PatientHealthState } = {};

    constructor(
        personalInformation: PersonalInformation,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        imageUrl: string,
        healthStates: { [stateId: UUID]: PatientHealthState }
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.imageUrl = imageUrl;
        this.healthStates = healthStates;
    }
}
