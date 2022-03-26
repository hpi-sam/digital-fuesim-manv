import { Type } from 'class-transformer';
import { IsNotIn, IsString, IsUUID, ValidateNested } from 'class-validator';
import { PatientStatus } from '..';
import type { PatientHealthState } from '..';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public personalInformation: PersonalInformation;

    @IsNotIn([undefined])
    public visibleStatus: PatientStatus | null;

    @IsString()
    public realStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    public healthStates: { [stateId: UUID]: PatientHealthState } = {};

    constructor(
        personalInformation: PersonalInformation,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        healthStates: { [stateId: UUID]: PatientHealthState },
        image: ImageProperties
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.image = image;
        this.healthStates = healthStates;
    }
}
