import { PatientTemplate } from '../..';
import type { ImageProperties } from '../../models/utils';

const defaultImage: ImageProperties = {
    url: '/assets/patient.svg',
    height: 80,
    aspectRatio: 1,
};

const greenPatientTemplate = new PatientTemplate(
    {
        sex: 'male',
        name: 'Max Mustermann',
        birthdate: '1.4.',
        biometry: '150cm, Glatze, große Brille',
        age: 18,
        adress: 'Musterstr. 1, 90768 Musterstadt',
    },
    'green',
    'green',
    defaultImage
);

const yellowPatientTemplate = new PatientTemplate(
    {
        sex: 'male',
        name: 'Walter Falter',
        birthdate: '7.3.',
        biometry: 'blaue Augen, weiße Haare, 174cm',
        age: 73,
        adress: 'Pappelstr. 69, 97537 Eschenburg',
    },
    'yellow',
    'yellow',
    defaultImage
);

const redPatientTemplate = new PatientTemplate(
    {
        sex: 'female',
        name: 'Maria Kohler',
        birthdate: '2.12.',
        biometry: 'grüne Augen, graue Haare, 167cm',
        age: 80,
        adress: 'Hannibal Str. 85, 12345 Hinterstadt',
    },
    'red',
    'red',
    defaultImage
);

const blackPatientTemplate = new PatientTemplate(
    {
        sex: 'male',
        name: 'John Doe',
        birthdate: '8.1.',
        biometry: 'kurze Haare, 186cm',
        age: 23,
        adress: 'Am Musterbahnhof 5, 10010 Musterdorf',
    },
    'black',
    'black',
    defaultImage
);

export const defaultPatientTemplates: PatientTemplate[] = [
    greenPatientTemplate,
    yellowPatientTemplate,
    redPatientTemplate,
    blackPatientTemplate,
];
