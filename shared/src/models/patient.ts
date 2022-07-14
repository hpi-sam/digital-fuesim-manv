import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { Catering } from './utils';
import { getCreate, ImageProperties, PatientStatus, Position } from './utils';
import { BiometricInformation } from './utils/biometric-information';
import { PatientStatusCode } from './utils/patient-status-code';
import { PersonalInformation } from './utils/personal-information';
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

    /**
     * A description of the expected patient behaviour over time
     * For the trainer
     */
    @ValidateNested()
    @Type(() => PatientStatusCode)
    public readonly patientStatusCode: PatientStatusCode;

    // TODO
    @IsString()
    public readonly pretriageStatus: PatientStatus;

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
        patientStatusCode: PatientStatusCode,
        pretriageStatus: PatientStatus,
        healthStates: { readonly [stateId: UUID]: PatientHealthState },
        currentHealthStateId: UUID,
        image: ImageProperties
    ) {
        this.personalInformation = personalInformation;
        this.biometricInformation = biometricInformation;
        this.patientStatusCode = patientStatusCode;
        this.pretriageStatus = pretriageStatus;
        this.healthStates = healthStates;
        this.currentHealthStateId = currentHealthStateId;
        this.image = image;
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
        readonly [stateId: string]: PatientHealthState;
    } = {};

    /**
     * The id of the current health state in {@link healthStates}
     */
    @IsString()
    public readonly currentHealthStateId: string;
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
    public readonly changeSpeed: number = 1;

    /**
     * The time a patient has been treated for
     */
    @IsNumber()
    @Min(0)
    public treatmentTime = 0;

    /**
     * The Resources assigned to a patient for roughly the last minute
     */
    @IsArray()
    public readonly treatmentHistory: readonly Catering[] = [];

    static readonly create = getCreate(this);
    /**
     * The time that is needed for personnel to automatically pretriage the patient
     * in milliseconds
     */
    private static readonly pretriageTimeThreshold: number = 2 * 60 * 1000;

    static getVisibleStatus(
        patient: Patient,
        pretriageEnabled: boolean,
        bluePatientsEnabled: boolean
    ) {
        const status =
            !pretriageEnabled ||
            patient.treatmentTime >= this.pretriageTimeThreshold
                ? patient.healthStates[patient.currentHealthStateId].status
                : patient.pretriageStatus;
        return status === 'blue' && !bluePatientsEnabled ? 'red' : status;
    }

    static getPretriageInformation(patient: Patient) {
        return patient.healthStates[patient.currentHealthStateId]
            .pretriageInformation;
    }

    static pretriageStatusIsLocked(patient: Patient): boolean {
        return patient.treatmentTime >= this.pretriageTimeThreshold;
    }

    static isInVehicle(patient: Patient): boolean {
        return patient.position === undefined;
    }
}
