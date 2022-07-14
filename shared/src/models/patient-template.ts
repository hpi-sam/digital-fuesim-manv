import { Type } from 'class-transformer';
import { IsDefined, IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import type { PatientStatusCode } from './utils';
import { BiometricInformation, getCreate } from './utils';
import { ImageProperties } from './utils/image-properties';
import { PersonalInformation } from './utils/personal-information';
import { Patient } from './patient';
import { ConditionParameters } from './patient-health-state';
import type { PatientHealthState } from '.';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => BiometricInformation)
    public readonly biometricInformation: BiometricInformation;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsDefined()
    public readonly healthStates: {
        readonly [stateId: string]: PatientHealthState;
    };

    @IsString()
    public readonly startingHealthStateId: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        biometricInformation: BiometricInformation,
        healthStates: { readonly [stateId: string]: PatientHealthState },
        image: ImageProperties,
        startingHealthStateId: string
    ) {
        this.biometricInformation = biometricInformation;
        this.image = image;
        this.healthStates = healthStates;
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
                const randomizedNextStateConditions = Object.values(
                    state.nextStateConditions
                ).map((condition) => {
                    let newEarliestTime = condition.earliestTime;
                    if (newEarliestTime) {
                        newEarliestTime = randomizeValue(newEarliestTime, 0.2);
                    }
                    let newLatestTime = condition.latestTime;
                    if (newLatestTime) {
                        newLatestTime = randomizeValue(newLatestTime, 0.2);
                    }
                    return ConditionParameters.create(
                        newEarliestTime,
                        newLatestTime,
                        condition.isBeingTreated,
                        condition.requiredMaterialAmount,
                        condition.requiredNotArztAmount,
                        condition.requiredNotSanAmount,
                        condition.requiredRettSanAmount,
                        condition.requiredSanAmount,
                        condition.matchingHealthStateId
                    );
                });

                // The function parameters will randomize by 20%
                return [
                    stateId,
                    {
                        ...state,
                        nextStateConditions: randomizedNextStateConditions,
                    },
                ];
            })
        );
        return Patient.create(
            PersonalInformation.generatePersonalInformation(
                template.biometricInformation.sex
            ),
            template.biometricInformation,
            patientStatusCode,
            'white',
            healthStates,
            template.startingHealthStateId,
            template.image
        );
    }
}

function randomizeValue(value: number, randomizeBy: number): number {
    return value + value * (Math.random() - 0.5) * randomizeBy;
}
