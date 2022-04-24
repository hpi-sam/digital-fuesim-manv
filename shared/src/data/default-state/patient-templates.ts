import {
    FunctionParameters,
    PatientHealthState,
    PatientTemplate,
} from '../../models';
import type { ImageProperties } from '../../models/utils';
import { healthPointsDefaults } from '../../models/utils';

const defaultMaleImage: ImageProperties = {
    url: '/assets/male-patient.svg',
    height: 80,
    aspectRatio: 1,
};

const defaultFemaleImage: ImageProperties = {
    url: '/assets/female-patient.svg',
    height: 80,
    aspectRatio: 1,
};

const stableState = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    []
);

// The amount of damage to kill an untreated patient with full health in 10 minutes
const soonDamage = -healthPointsDefaults.greenMax / (10 * 60);
const needsNotarztSoonState = PatientHealthState.create(
    FunctionParameters.create(
        soonDamage,
        -soonDamage * 2,
        -soonDamage,
        -soonDamage / 2
    ),
    []
);

const needsSomeoneSoonState = PatientHealthState.create(
    FunctionParameters.create(
        soonDamage,
        -soonDamage,
        -soonDamage,
        -soonDamage
    ),
    []
);

const soonDamageUntilYellow =
    -(healthPointsDefaults.greenMax - healthPointsDefaults.yellowMax) /
    (10 * 60);

const needsSomeoneSoonGreenState = PatientHealthState.create(
    FunctionParameters.create(
        soonDamageUntilYellow,
        -soonDamageUntilYellow,
        -soonDamageUntilYellow,
        -soonDamageUntilYellow
    ),
    [
        {
            matchingHealthStateId: stableState.id,
            maximumHealth: healthPointsDefaults.yellowMax - 1,
        },
    ]
);

const needsSomeoneLaterState2 = needsSomeoneSoonState;

const needsSomeoneLaterState1 = PatientHealthState.create(
    FunctionParameters.create(0, 0, 0, 0),
    [
        {
            earliestTime: 5 * 60 * 1000,
            matchingHealthStateId: needsSomeoneLaterState2.id,
        },
    ]
);

const greenStablePatientTemplate = PatientTemplate.create(
    'SK III, stabil',
    {
        sex: 'male',
        externalFeatures: '150cm, Glatze, große Brille',
        age: 18,
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    stableState.id
);

const greenGettingWorsePatientTemplate = PatientTemplate.create(
    'SK III, Verschlechterung (< 10 min), bis SK II',
    {
        sex: 'male',
        externalFeatures: '150cm, Glatze, große Brille',
        age: 18,
    },
    true,
    {
        [stableState.id]: stableState,
        [needsSomeoneSoonGreenState.id]: needsSomeoneSoonGreenState,
    },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    needsSomeoneSoonGreenState.id
);

const greenGettingWorseAfter5minPatientTemplate = PatientTemplate.create(
    'SK III, stabil (5 min), Verschlechterung (< 10 min), ex',
    {
        sex: 'male',
        externalFeatures: '150cm, Glatze, große Brille',
        age: 18,
    },
    true,
    {
        [needsSomeoneLaterState1.id]: needsSomeoneLaterState1,
        [needsSomeoneLaterState2.id]: needsSomeoneLaterState2,
    },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    needsSomeoneLaterState1.id
);

const yellowGettingWorsePatientTemplate = PatientTemplate.create(
    'SK II, Verschlechterung (< 7 min), ex',
    {
        sex: 'male',
        externalFeatures: 'blaue Augen, weiße Haare, 174cm',
        age: 73,
    },
    true,
    { [needsSomeoneSoonState.id]: needsSomeoneSoonState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    needsSomeoneSoonState.id
);

const yellowNeedsNotarztPatientTemplate = PatientTemplate.create(
    'SK II, Notarzt in < 7 min, ex',
    {
        sex: 'male',
        externalFeatures: 'Glatze, 173cm',
        age: 37,
    },
    true,
    { [needsNotarztSoonState.id]: needsNotarztSoonState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    needsNotarztSoonState.id
);

const redPatientTemplate = PatientTemplate.create(
    'SK I, Verschlechterung (< 4 min), ex',
    {
        sex: 'female',
        externalFeatures: 'grüne Augen, graue Haare, 167cm',
        age: 80,
    },
    true,
    { [needsSomeoneSoonState.id]: needsSomeoneSoonState },
    defaultFemaleImage,
    healthPointsDefaults.redMax,
    needsSomeoneSoonState.id
);

const blackPatientTemplate = PatientTemplate.create(
    'ex',
    {
        sex: 'male',
        externalFeatures: 'kurze Haare, 186cm',
        age: 23,
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.blackMax,
    stableState.id
);

export const defaultPatientTemplates: readonly PatientTemplate[] = [
    greenStablePatientTemplate,
    greenGettingWorsePatientTemplate,
    greenGettingWorseAfter5minPatientTemplate,
    yellowGettingWorsePatientTemplate,
    yellowNeedsNotarztPatientTemplate,
    redPatientTemplate,
    blackPatientTemplate,
];
