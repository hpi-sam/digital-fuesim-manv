import { Type } from 'class-transformer';
import {
    IsNumber,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import type { Mutable } from '../utils';
import { cloneDeepMutable, UUID, uuidValidationOptions } from '../utils';
import { IsIdMap, IsLiteralUnion } from '../utils/validators';
import {
    getCreate,
    HealthPoints,
    ImageProperties,
    IsValidHealthPoint,
    PatientStatus,
    patientStatusAllowedValues,
} from './utils';
import { BiometricInformation } from './utils/biometric-information';
import { PersonalInformation } from './utils/personal-information';
import { PatientHealthState } from './patient-health-state';
import type { Patient } from '.';

export class HospitalPatient {
    /**
     * Id of the patient that was transported to a hospital, the original patient gets deleted
     */
    @IsUUID(4, uuidValidationOptions)
    public readonly patientId: UUID;

    /**
     * the vehicle that a patient was transported with
     */
    @IsString()
    public readonly vehicleType: string;

    /**
     * The time the patient started to be sent to a hospital
     */
    @IsNumber()
    public readonly startTime: number;

    /**
     * The time the patient would arrive at a hospital
     */
    @IsNumber()
    public readonly arrivalTime: number;

    @ValidateNested()
    @Type(() => PersonalInformation)
    public readonly personalInformation: PersonalInformation;

    @ValidateNested()
    @Type(() => BiometricInformation)
    public readonly biometricInformation: BiometricInformation;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly pretriageStatus: PatientStatus;

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly realStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsIdMap(PatientHealthState)
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
    @IsValidHealthPoint()
    public readonly health: HealthPoints;

    @IsNumber()
    @Min(0)
    public treatmentTime = 0;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        patientId: UUID,
        vehicleType: string,
        startTime: number,
        arrivalTime: number,
        personalInformation: PersonalInformation,
        biometricInformation: BiometricInformation,
        pretriageStatus: PatientStatus,
        realStatus: PatientStatus,
        healthStates: { readonly [stateId: UUID]: PatientHealthState },
        currentHealthStateId: UUID,
        image: ImageProperties,
        health: HealthPoints,
        treatmentTime: number
    ) {
        this.patientId = patientId;
        this.vehicleType = vehicleType;
        this.startTime = startTime;
        this.arrivalTime = arrivalTime;
        this.personalInformation = personalInformation;
        this.biometricInformation = biometricInformation;
        this.pretriageStatus = pretriageStatus;
        this.realStatus = realStatus;
        this.healthStates = healthStates;
        this.currentHealthStateId = currentHealthStateId;
        this.image = image;
        this.health = health;
        this.treatmentTime = treatmentTime;
    }

    static readonly create = getCreate(this);

    /**
     * used to create a Mutable\<HospitalPatient\> inside action-reducers/hospital.ts
     * @param patient that should be copied
     * @param startTime time the transport starts
     * @param arrivalTime time the patient would arrive at a hospital
     * @returns a Mutable\<HospitalPatient\>
     */
    static createFromPatient(
        patient: Mutable<Patient>,
        vehicleType: string,
        startTime: number,
        arrivalTime: number
    ) {
        return cloneDeepMutable(
            HospitalPatient.create(
                patient.id,
                vehicleType,
                startTime,
                arrivalTime,
                patient.personalInformation,
                patient.biometricInformation,
                patient.pretriageStatus,
                patient.realStatus,
                patient.healthStates,
                patient.currentHealthStateId,
                patient.image,
                patient.health,
                patient.treatmentTime
            )
        );
    }
}
