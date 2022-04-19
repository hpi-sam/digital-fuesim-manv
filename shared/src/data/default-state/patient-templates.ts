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

const defaultHealthState = PatientHealthState.create(
    FunctionParameters.create(-1_000, 2_000, 1_000, 500),
    []
);

const greenPatientTemplate = PatientTemplate.create(
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

const yellowPatientTemplate = PatientTemplate.create(
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

const yellowUntriagedPatientTemplate = PatientTemplate.create(
    {
        sex: 'männlich',
        name: 'Thomas Müller',
        birthdate: '14.3.',
        biometry: 'Glatze, 173cm',
        age: 37,
        address: 'Pappelstr. 70, 97537 Eschenburg',
    },
    false,
    { [defaultHealthState.id]: defaultHealthState },
    defaultMaleImage,
    healthPointsDefaults.yellowMax,
    defaultHealthState.id
);

const redPatientTemplate = PatientTemplate.create(
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

const blackPatientTemplate = PatientTemplate.create(
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

export const defaultPatientTemplates: readonly PatientTemplate[] = [
    greenPatientTemplate,
    yellowPatientTemplate,
    yellowUntriagedPatientTemplate,
    redPatientTemplate,
    blackPatientTemplate,
];
