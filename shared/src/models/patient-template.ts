import { Type } from 'class-transformer';
import { IsDefined, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { PatientStatusCode } from './utils';
import {
    BiometricInformation,
    getCreate,
    getStatus,
    HealthPoints,
    IsValidHealthPoint,
} from './utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';
import { Patient } from './patient';
import type { FunctionParameters } from './patient-health-state';
import { PretriageInformation } from './utils/pretriage-information';
import type { PatientHealthState } from '.';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => BiometricInformation)
    public readonly biometricInformation: BiometricInformation;

    @ValidateNested()
    @Type(() => PretriageInformation)
    public readonly pretriageInformation: PretriageInformation;

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
        biometricInformation: BiometricInformation,
        pretriageInformation: PretriageInformation,
        healthStates: { readonly [stateId: UUID]: PatientHealthState },
        image: ImageProperties,
        health: HealthPoints,
        startingHealthStateId: UUID
    ) {
        this.biometricInformation = biometricInformation;
        this.pretriageInformation = pretriageInformation;
        this.image = image;
        this.healthStates = healthStates;
        this.health = health;
        this.startingHealthStateId = startingHealthStateId;
    }

    static readonly create = getCreate(this);

    public static generatePatient(
        template: PatientTemplate,
        patientStatusCode: PatientStatusCode
    ): Patient {
        // Randomize function parameters
        const healthStates = Object.fromEntries(
            Object.entries(template.healthStates).map(([stateId, state]) => {
                const functionParameters = Object.fromEntries(
                    Object.entries(state.functionParameters).map(
                        ([key, value]) => [
                            key as keyof FunctionParameters,
                            randomizeValue(value, 0.2),
                        ]
                        // The signatures for Object.fromEntries and Object.entries are not made for literals...
                    ) as [keyof FunctionParameters, any][]
                ) as FunctionParameters;
                // The function parameters will randomize by 20%
                return [
                    stateId,
                    {
                        ...state,
                        functionParameters,
                    },
                ];
            })
        );
        const status = getStatus(template.health);
        return Patient.create(
            PersonalInformation.generatePersonalInformation(
                template.biometricInformation.sex
            ),
            template.biometricInformation,
            template.pretriageInformation,
            patientStatusCode,
            'white',
            status,
            healthStates,
            template.startingHealthStateId,
            template.image,
            template.health
        );
    }
}

function randomizeValue(value: number, randomizeBy: number): number {
    return value + value * (Math.random() - 0.5) * randomizeBy;
}
