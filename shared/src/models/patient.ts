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
import { UUID, uuid, uuidValidationOptions } from '../utils';
import {
    Position,
    PatientStatus,
    HealthPoints,
    ImageProperties,
    healthPointsDefaults,
    getCreate,
} from './utils';
import { PersonalInformation } from './utils/personal-information';
import { BiometricInformation } from './utils/biometric-information';
import { PatientStatusCode } from './utils/patient-status-code';
import { PretriageInformation } from './utils/pretriage-information';
import type { PatientHealthState } from '.';

export class Patient {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => PersonalInformation)
    public readonly personalInformation: PersonalInformation;

    @ValidateNested()
    @Type(() => BiometricInformation)
    public readonly biometricInformation: BiometricInformation;

    @ValidateNested()
    @Type(() => PretriageInformation)
    public readonly pretriageInformation: PretriageInformation;
    /**
     * A description of the expected patient behaviour over time
     * For the trainer
     */
    @ValidateNested()
    @Type(() => PatientStatusCode)
    public readonly patientStatusCode: PatientStatusCode;

    // TODO
    @IsNotIn([undefined])
    public readonly visibleStatus: PatientStatus;

    // TODO
    @IsString()
    public readonly realStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        personalInformation: PersonalInformation,
        biometricInformation: BiometricInformation,
        pretriageInformation: PretriageInformation,
        patientStatusCode: PatientStatusCode,
        visibleStatus: PatientStatus,
        realStatus: PatientStatus,
        healthStates: { readonly [stateId: UUID]: PatientHealthState },
        currentHealthStateId: UUID,
        image: ImageProperties,
        health: HealthPoints
    ) {
        this.personalInformation = personalInformation;
        this.biometricInformation = biometricInformation;
        this.pretriageInformation = pretriageInformation;
        this.patientStatusCode = patientStatusCode;
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
    public readonly position?: Position;
    /**
     * Exclusive-or to {@link position}
     */
    @IsUUID(4, uuidValidationOptions)
    @IsOptional()
    public readonly vehicleId?: UUID;

    /**
     * The time the patient already is in the current state
     */
    @IsNumber()
    public readonly stateTime: number = 0;

    @IsDefined()
    public readonly healthStates: {
        readonly [stateId: UUID]: PatientHealthState;
    } = {};

    /**
     * The id of the current health state in {@link healthStates}
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly currentHealthStateId: UUID;
    /**
     * See {@link HealthPoints} for context of this property.
     */
    @IsNumber()
    @Max(healthPointsDefaults.max)
    @Min(healthPointsDefaults.min)
    public readonly health: HealthPoints;
    /**
     * Whether the patient is currently being treated by a personnel
     */
    @IsBoolean()
    public readonly isBeingTreated: boolean = false;
    /**
     * The speed with which the patients healthStatus changes
     * if it is 0.5 every patient changes half as fast (slow motion)
     */
    @IsNumber()
    @Min(0)
    public readonly timeSpeed: number = 1;

    @IsNumber()
    @Min(0)
    public treatmentTime = 0;

    static readonly create = getCreate(this);

    static isInVehicle(patient: Patient): boolean {
        return patient.position === undefined;
    }
}
