import {
    FunctionParameters,
    PatientHealthState,
    PatientTemplate,
} from '../../models';
import type { ImageProperties } from '../../models/utils';
import { healthPointsDefaults } from '../../models/utils';

const defaultMaleImage: ImageProperties = {
    url: '/assets/male_patient.svg',
    height: 80,
    aspectRatio: 1,
};

const defaultFemaleImage: ImageProperties = {
    url: '/assets/female_patient.svg',
    height: 80,
    aspectRatio: 1,
};

const defaultHealthState = new PatientHealthState(
    new FunctionParameters(-1_000, 2_000, 1_000, 500),
    []
);

const greenPatientTemplate = new PatientTemplate(
    {
        sex: 'männlich',
        name: 'Max Mustermann',
        birthdate: '1.4.',
        biometry: '150cm, Glatze, große Brille',
        age: 18,
        address: 'Musterstr. 1, 90768 Musterstadt',
    },
    true,
    { [defaultHealthState.id]: defaultHealthState },
    defaultMaleImage,
    healthPointsDefaults.greenMax,
    defaultHealthState.id
);

const yellowPatientTemplate = new PatientTemplate(
    {
        sex: 'männlich',
        name: 'Walter Falter',
        birthdate: '7.3.',
        biometry: 'blaue Augen, weiße Haare, 174cm',
        age: 73,
        address: 'Pappelstr. 69, 97537 Eschenburg',
    },
    true,
    { [defaultHealthState.id]: defaultHealthState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    defaultHealthState.id
);

const redPatientTemplate = new PatientTemplate(
    {
        sex: 'weiblich',
        name: 'Maria Kohler',
        birthdate: '2.12.',
        biometry: 'grüne Augen, graue Haare, 167cm',
        age: 80,
        address: 'Hannibal Str. 85, 12345 Hinterstadt',
    },
    true,
    { [defaultHealthState.id]: defaultHealthState },
    defaultFemaleImage,
    healthPointsDefaults.redMax,
    defaultHealthState.id
);

const blackPatientTemplate = new PatientTemplate(
    {
        sex: 'männlich',
        name: 'John Doe',
        birthdate: '8.1.',
        biometry: 'kurze Haare, 186cm',
        age: 23,
        address: 'Am Musterbahnhof 5, 10010 Musterdorf',
    },
    true,
    { [defaultHealthState.id]: defaultHealthState },
    defaultMaleImage,
    healthPointsDefaults.blackMax,
    defaultHealthState.id
);

export const defaultPatientTemplates: PatientTemplate[] = [
    greenPatientTemplate,
    yellowPatientTemplate,
    redPatientTemplate,
    blackPatientTemplate,
];
