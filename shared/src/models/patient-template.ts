import { Type } from 'class-transformer';
import {
    IsUUID,
    ValidateNested,
    isString,
    isNotEmpty,
    maxLength,
    IsString,
    IsNotEmpty,
    MaxLength,
} from 'class-validator';
import { uuidValidationOptions, UUID, uuid, cloneDeepMutable } from '../utils';
import { IsMap } from '../utils/validators';
import { Patient } from './patient';
import {
    PatientHealthState,
    ConditionParameters,
} from './patient-health-state';
import type { PatientStatusCode } from './utils';
import { BiometricInformation, ImageProperties, getCreate } from './utils';
import { PersonalInformation } from './utils/personal-information';

export class PatientTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => BiometricInformation)
    public readonly biometricInformation: BiometricInformation;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsMap(
        PatientHealthState,
        ((key) => isString(key) && isNotEmpty(key) && maxLength(key, 255)) as (
            key: unknown
        ) => key is string,
        (state) => state.name
    )
    public readonly healthStates: {
        readonly [stateId: string]: PatientHealthState;
    };

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    public readonly startingHealthStateName: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        biometricInformation: BiometricInformation,
        healthStates: { readonly [stateId: string]: PatientHealthState },
        image: ImageProperties,
        startingHealthStateName: string
    ) {
        this.biometricInformation = biometricInformation;
        this.image = image;
        this.healthStates = healthStates;
        this.startingHealthStateName = startingHealthStateName;
    }

    static readonly create = getCreate(this);

    public static generatePatient(
        template: PatientTemplate,
        patientStatusCode: PatientStatusCode
    ): Patient {
        // Randomize function parameters
        const healthStates = Object.fromEntries(
            Object.entries(cloneDeepMutable(template.healthStates)).map(
                ([stateId, state]) => {
                    const randomizedNextStateConditions = Object.values(
                        state.nextStateConditions
                    ).map((condition) => {
                        let newEarliestTime = condition.earliestTime;
                        if (newEarliestTime) {
                            newEarliestTime = randomizeValue(
                                newEarliestTime,
                                0.2
                            );
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
                            condition.matchingHealthStateName
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
                }
            )
        );
        return Patient.create(
            PersonalInformation.generatePersonalInformation(
                template.biometricInformation.sex
            ),
            template.biometricInformation,
            patientStatusCode,
            'white',
            healthStates,
            template.startingHealthStateName,
            template.image,
            ''
        );
    }
}

function randomizeValue(value: number, randomizeBy: number): number {
    return value + value * (Math.random() - 0.5) * randomizeBy;
}
