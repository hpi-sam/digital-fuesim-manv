import {
    FunctionParameters,
    PatientHealthState,
    PatientTemplate,
} from '../../models';
import type { ImageProperties, MedicalInformation } from '../../models/utils';
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
            maximumHealth: healthPointsDefaults.yellowMax,
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

const defaultHealthState: MedicalInformation = {
    consciousness: 'wach, orientiert',
    breathing: 'unauffällig',
    hearing: 'unauffällig',
    skin: 'unauffällig',
    pain: 'keine',
    pupils: 'unauffällig',
    psyche: 'leicht aufgeregt',
    pulse: '80',
    injuries: 'keine',
    bodyCheck: 'keine Auffälligkeiten',
    walkable: true,
};

const stablePatient1Template = PatientTemplate.create(
    'SK III, stabil',
    {
        sex: 'male',
        externalFeatures: '160cm, kurze, braune Haare',
        age: 25,
    },
    {
        ...defaultHealthState,
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    stableState.id
);

const stablePatient2Template = PatientTemplate.create(
    'SK III, stabil',
    {
        sex: 'male',
        externalFeatures: '175cm, Brille',
        age: 43,
    },
    {
        ...defaultHealthState,
        pulse: '83',
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    stableState.id
);

const stablePatient3Template = PatientTemplate.create(
    'SK III, stabil',
    {
        sex: 'female',
        externalFeatures: '150cm, lange, blonde Haare',
        age: 32,
    },
    {
        ...defaultHealthState,
        pulse: '75',
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    stableState.id
);

const carDriverRedDamage = -healthPointsDefaults.redMax / (8 * 60);
const carDriverRedState1 = PatientHealthState.create(
    FunctionParameters.create(
        carDriverRedDamage,
        -carDriverRedDamage,
        -carDriverRedDamage,
        -carDriverRedDamage
    ),
    []
);

const carDriverRedTemplate = PatientTemplate.create(
    'SK I, Verschlechterung (< 8min), ex',
    {
        sex: 'male',
        externalFeatures: '170cm, braune Haare, extrem adipös',
        age: 50,
    },
    {
        consciousness: 'bewusstlos, Massenbewegung auf Schmerz',
        breathing: 'Atemwegsverlegung',
        pulse: '85, gut tastbar',
        skin: 'tief zyanotisch',
        pain: 'entfällt',
        pupils: 'rechts weit',
        psyche: '-',
        hearing: '-',
        injuries:
            'Kopfplatzwunde über dem Ohr; Prellmarke Stirn; Gesicht blutverschmiert',
        bodyCheck: 'Unterarmfraktur rechts',
        walkable: false,
    },
    true,
    { [carDriverRedState1.id]: carDriverRedState1 },
    defaultMaleImage,
    healthPointsDefaults.redMax,
    carDriverRedState1.id
);

const carPassengerYellowDamage =
    -(healthPointsDefaults.yellowMax - healthPointsDefaults.redMax) / (10 * 60);

const carPassengerYellowState1 = PatientHealthState.create(
    FunctionParameters.create(
        carPassengerYellowDamage,
        -carPassengerYellowDamage,
        -carPassengerYellowDamage,
        -carPassengerYellowDamage
    ),
    [
        {
            matchingHealthStateId: stableState.id,
            maximumHealth: healthPointsDefaults.redMax,
        },
    ]
);

const carPassengerYellowTemplate = PatientTemplate.create(
    'SK II, Verschlechterung (< 10 min), SK I',
    {
        sex: 'male',
        externalFeatures: '170cm, braune Haare, extrem adipös',
        age: 50,
    },
    {
        consciousness: 'wach, verwirrt',
        breathing: 'unauffällig',
        pulse: '123, Puls flach',
        skin: 'kaltschweiß',
        pain: 'starke',
        pupils: 'isocor',
        psyche: 'aufgeregt',
        hearing: 'unauffällig',
        injuries:
            'Prellmarke Unterschenkel rechts; Fehlstellung rechtes Sprunggelenk; Wunde Unterarm rechts',
        bodyCheck: 'Druckschmerz rechte Hüfte; Prellung Unterschenkel links',
        walkable: false,
    },
    true,
    {
        [stableState.id]: stableState,
        [carPassengerYellowState1.id]: carPassengerYellowState1,
    },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    carPassengerYellowState1.id
);

const femaleHitByCarTemplate = PatientTemplate.create(
    'SK II, stable',
    {
        sex: 'female',
        externalFeatures: 'graue Haare, Brille, grüne Augen, ca. 1,60 m',
        age: 75,
    },
    {
        consciousness: 'somolent',
        breathing: 'flache Atmung',
        pulse: '132, fadenförmig',
        skin: 'grau marmoriert',
        pain: 'stärkste',
        pupils: 'isocor',
        psyche: 'teilnahmslos',
        hearing: 'unauffällig',
        injuries:
            'große Weichteilquetschung linker Unterschenkel, nur noch mäßig blutend; aber schon deutlicher Blutverlust',
        bodyCheck:
            'Oberarmfraktur rechts; fraglicher Fremdkörper rechte Hand in Wunde; blutende Prellmarke am Hinterkopf',
        walkable: false,
    },
    true,
    { [stableState.id]: stableState },
    defaultFemaleImage,
    healthPointsDefaults.yellowMax,
    stableState.id
);

const driverCar2Template = PatientTemplate.create(
    'SK III, stable, teilnahmslos',
    {
        sex: 'male',
        externalFeatures: 'braune Haare, braune Augen, 1,72 m',
        age: 35,
    },
    {
        consciousness: 'verwirrt',
        breathing: 'unauffällig',
        pulse: '82, gut tastbar',
        skin: 'unauffällig',
        pain: 'keine',
        pupils: 'isocor',
        psyche: 'teilnahmslos',
        hearing: 'unauffällig',
        injuries: 'keine äußeren Verletzungen sichtbar',
        bodyCheck:
            'Pat. ist teilnahmslos; keine Kooperation bei der Untersuchung',
        walkable: true,
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    stableState.id
);

const greenGettingWorsePatientTemplate = PatientTemplate.create(
    '?SK III, Verschlechterung (< 10 min), bis SK II',
    {
        sex: 'male',
        externalFeatures: '160cm, kurze, braune Haare',
        age: 25,
    },
    {
        ...defaultHealthState,
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
    '?SK III, stabil (5 min), Verschlechterung (< 10 min), ex',
    {
        sex: 'male',
        externalFeatures: '180cm, blonde Haare',
        age: 18,
    },
    {
        ...defaultHealthState,
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
    '?SK II, Verschlechterung (< 7 min), ex',
    {
        sex: 'male',
        externalFeatures: 'blaue Augen, weiße Haare, 174cm',
        age: 73,
    },
    {
        ...defaultHealthState,
    },
    true,
    { [needsSomeoneSoonState.id]: needsSomeoneSoonState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    needsSomeoneSoonState.id
);

const yellowNeedsNotarztPatientTemplate = PatientTemplate.create(
    '?SK II, Notarzt in < 7 min, ex',
    {
        sex: 'male',
        externalFeatures: 'Glatze, 173cm',
        age: 37,
    },
    {
        ...defaultHealthState,
    },
    true,
    { [needsNotarztSoonState.id]: needsNotarztSoonState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    needsNotarztSoonState.id
);

const redPatientTemplate = PatientTemplate.create(
    '?SK I, Verschlechterung (< 4 min), ex',
    {
        sex: 'female',
        externalFeatures: 'grüne Augen, graue Haare, 167cm',
        age: 80,
    },
    {
        ...defaultHealthState,
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
    {
        consciousness: 'bewusstlos, keine Reaktion auf Schmerzreiz',
        breathing: 'Apnoe',
        hearing: '-',
        skin: 'kühl',
        pain: '-',
        pupils: '-',
        psyche: '-',
        pulse: '0',
        injuries: '',
        bodyCheck: '',
        walkable: false,
    },
    true,
    { [stableState.id]: stableState },
    defaultMaleImage,
    healthPointsDefaults.blackMax,
    stableState.id
);

export const defaultPatientTemplates: readonly PatientTemplate[] = [
    stablePatient1Template,
    stablePatient2Template,
    stablePatient3Template,
    carDriverRedTemplate,
    carPassengerYellowTemplate,
    femaleHitByCarTemplate,
    driverCar2Template,
    greenGettingWorsePatientTemplate,
    greenGettingWorseAfter5minPatientTemplate,
    yellowGettingWorsePatientTemplate,
    yellowNeedsNotarztPatientTemplate,
    redPatientTemplate,
    blackPatientTemplate,
];
