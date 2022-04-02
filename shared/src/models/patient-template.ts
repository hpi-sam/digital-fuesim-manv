import { Type } from 'class-transformer';
import {
    IsDefined,
    IsNotIn,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { HealthPoints, IsValidHealthPoint, PatientStatus } from './utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';
import type { PatientHealthState } from '.';

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

    @IsDefined()
    public healthStates: { [stateId: UUID]: PatientHealthState } = {};

    @IsValidHealthPoint()
    public health: HealthPoints;

    constructor(
        personalInformation: PersonalInformation,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        healthStates: { [stateId: UUID]: PatientHealthState },
        image: ImageProperties,
        health: HealthPoints
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.image = image;
        this.healthStates = healthStates;
        this.health = health;
    }
}
