import { Type } from 'class-transformer';
import { IsBoolean, IsDefined, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, HealthPoints, IsValidHealthPoint } from './utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';
import type { PatientHealthState } from '.';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public readonly personalInformation: PersonalInformation;

    @IsBoolean()
    public readonly isPreTriaged: boolean;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsDefined()
    public readonly healthStates: {
        readonly [stateId: UUID]: PatientHealthState;
    };

    @IsUUID(4, uuidValidationOptions)
    public readonly startingHealthStateId: UUID;

    @IsValidHealthPoint()
    public readonly health: HealthPoints;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        personalInformation: PersonalInformation,
        isPreTriaged: boolean,
        healthStates: { readonly [stateId: UUID]: PatientHealthState },
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
