import { Type } from 'class-transformer';
import {
    IsUUID,
    ValidateNested,
    IsOptional,
    IsNumber,
    isString,
    isNotEmpty,
    maxLength,
    IsString,
    IsNotEmpty,
    MaxLength,
    Min,
    IsBoolean,
    IsArray,
    IsObject,
    isEmpty,
} from 'class-validator';
import { uuidValidationOptions, UUID, uuid, UUIDSet } from '../utils';
import { IsLiteralUnion, IsMap, IsUUIDSet } from '../utils/validators';
import { PatientHealthState } from './patient-health-state';
import type { Catering } from './utils';
import {
    BiometricInformation,
    PatientStatusCode,
    patientStatusAllowedValues,
    PatientStatus,
    ImageProperties,
    Position,
    getCreate,
} from './utils';
import { PersonalInformation } from './utils/personal-information';

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

    @IsLiteralUnion(patientStatusAllowedValues)
    public readonly pretriageStatus: PatientStatus;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

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

    @IsMap(
        PatientHealthState,
        ((key) => isString(key) && isNotEmpty(key) && maxLength(key, 255)) as (
            key: unknown
        ) => key is string,
        (state) => state.name
    )
    public readonly healthStates: {
        readonly [stateId: string]: PatientHealthState;
    } = {};

    /**
     * The id of the current health state in {@link healthStates}
     */
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    public readonly currentHealthStateName: UUID;

    @IsUUIDSet()
    public readonly assignedPersonnelIds: UUIDSet = {};

    @IsUUIDSet()
    public readonly assignedMaterialIds: UUIDSet = {};
    /**
     * The speed with which the patients healthStatus changes
     * if it is 0.5 every patient changes half as fast (slow motion)
     */
    @IsNumber()
    @Min(0)
    public readonly changeSpeed: number = 1;

    /**
     * Whether the {@link getVisibleStatus} of this patient has changed
     * since the last time it was updated which personnel and materials treat him/her.
     * Use this to prevent unnecessary recalculations for patients that didn't change -> performance optimization.
     */
    @IsBoolean()
    public readonly visibleStatusChanged: boolean = false;

    /**
     * This can be any arbitrary string. It gives trainers the freedom to add additional functionalities that are not natively supported by this application (like an hospital ticket system)
     */
    @IsString()
    @MaxLength(65535)
    public readonly remarks: string;

    /**
     * The time a patient has been treated for
     */
    @IsNumber()
    @Min(0)
    public treatmentTime = 0;

    /**
     * The time that is needed for personnel to automatically pretriage the patient
     * in milliseconds
     */
    private static readonly pretriageTimeThreshold: number = 2 * 60 * 1000;

    @IsArray()
    @IsObject({ each: true })
    public readonly treatmentHistory: readonly Catering[] = [];

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        // TODO: Specify patient data (e.g. injuries, name, etc.)
        personalInformation: PersonalInformation,
        biometricInformation: BiometricInformation,
        patientStatusCode: PatientStatusCode,
        pretriageStatus: PatientStatus,
        healthStates: { readonly [stateName: string]: PatientHealthState },
        currentHealthStateName: string,
        image: ImageProperties,
        remarks: string
    ) {
        this.personalInformation = personalInformation;
        this.biometricInformation = biometricInformation;
        this.patientStatusCode = patientStatusCode;
        this.pretriageStatus = pretriageStatus;
        this.healthStates = healthStates;
        this.currentHealthStateName = currentHealthStateName;
        this.image = image;
        this.remarks = remarks;
    }

    static readonly create = getCreate(this);

    static getVisibleStatus(
        patient: Patient,
        pretriageEnabled: boolean,
        bluePatientsEnabled: boolean
    ) {
        const status =
            !pretriageEnabled ||
            patient.treatmentTime >= this.pretriageTimeThreshold
                ? patient.healthStates[patient.currentHealthStateName]!.status
                : patient.pretriageStatus;
        return status === 'blue' && !bluePatientsEnabled ? 'red' : status;
    }

    static getPretriageInformation(patient: Patient) {
        return patient.healthStates[patient.currentHealthStateName]!
            .pretriageInformation;
    }

    static pretriageStatusIsLocked(patient: Patient): boolean {
        return patient.treatmentTime >= this.pretriageTimeThreshold;
    }

    static isInVehicle(patient: Patient): boolean {
        return patient.position === undefined;
    }

    static isTreatedByPersonnel(patient: Patient) {
        return !isEmpty(patient.assignedPersonnelIds);
    }
}
