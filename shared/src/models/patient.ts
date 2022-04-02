import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsNotIn,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Immutable, UUID, uuid, uuidValidationOptions } from '../utils';
import {
    Position,
    PatientStatus,
    HealthPoints,
    ImageProperties,
    healthPointsDefaults,
} from './utils';
import { PersonalInformation } from './utils/personal-information';
import type { PatientHealthState } from '.';

export class Patient {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public personalInformation: PersonalInformation;

    // TODO
    @IsNotIn([undefined])
    public visibleStatus: PatientStatus | null;

    // TODO
    @IsString()
    public realStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        personalInformation: PersonalInformation,
        visibleStatus: PatientStatus | null,
        realStatus: PatientStatus,
        healthStates: Immutable<{ [stateId: UUID]: PatientHealthState }>,
        currentHealthStateId: UUID,
        image: ImageProperties,
        health: HealthPoints
    ) {
        this.personalInformation = personalInformation;
        this.visibleStatus = visibleStatus;
        this.realStatus = realStatus;
        this.healthStates = healthStates;
        this.currentHealthStateId = currentHealthStateId;
        this.image = image;
        this.health = health;
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

    /**
     * The time the patient already is in the current state
     */
    @IsNumber()
    stateTime = 0;

    @IsDefined()
    healthStates: Immutable<{ [stateId: UUID]: PatientHealthState }> = {};

    /**
     * The id of the current health state in {@link healthStates}
     */
    @IsUUID(4, uuidValidationOptions)
    currentHealthStateId: UUID;
    /**
     * See {@link HealthPoints} for context of this property.
     */
    @IsNumber()
    @Max(healthPointsDefaults.max)
    @Min(healthPointsDefaults.min)
    health: HealthPoints;
    /**
     * Wether the patient is currently being treated by a personnel
     */
    @IsBoolean()
    isBeingTreated = false;
    /**
     * The speed with which the patients healthStatus changes
     * if it is 0.5 every patient changes half as fast (slow motion)
     */
    @IsNumber()
    @Min(0)
    timeSpeed = 1;
}
