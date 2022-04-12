import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, HealthPoints, IsValidHealthPoint } from './utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';
import type { PatientHealthState } from '.';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public personalInformation: PersonalInformation;

    @IsBoolean()
    public isPreTriaged: boolean;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    @IsDefined()
    public healthStates: { [stateId: UUID]: PatientHealthState };

    @IsUUID(4, uuidValidationOptions)
    public startingHealthStateId: UUID;

    @IsValidHealthPoint()
    public health: HealthPoints;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        personalInformation: PersonalInformation,
        isPreTriaged: boolean,
        healthStates: { [stateId: UUID]: PatientHealthState },
        image: ImageProperties,
        health: HealthPoints,
        startingHealthStateId: UUID
    ) {
        this.personalInformation = personalInformation;
        this.isPreTriaged = isPreTriaged;
        this.image = image;
        this.healthStates = healthStates;
        this.health = health;
        this.startingHealthStateId = startingHealthStateId;
    }

    static readonly create = getCreate(this);
}
