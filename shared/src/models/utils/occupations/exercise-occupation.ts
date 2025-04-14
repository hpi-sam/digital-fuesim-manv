import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils/index.js';
import { IntermediateOccupation } from './intermediate-occupation.js';
import { Occupation } from './occupation.js';
import { NoOccupation } from './no-occupation.js';
import { LoadOccupation } from './load-occupation.js';
import { WaitForTransferOccupation } from './wait-for-transfer-occupation.js';
import { UnloadingOccupation } from './unloading-occupation.js';
import { PatientTransferOccupation } from './patient-transfer-occupation.js';

export const occupations = {
    IntermediateOccupation,
    NoOccupation,
    LoadOccupation,
    WaitForTransferOccupation,
    UnloadingOccupation,
    PatientTransferOccupation,
};

export type ExerciseOccupation = InstanceType<
    (typeof occupations)[keyof typeof occupations]
>;

type ExerciseOccupationDictionary = {
    [Occupation in ExerciseOccupation as Occupation['type']]: Constructor<Occupation>;
};

export type ExerciseOccupationType = ExerciseOccupation['type'];

export const occupationDictionary: ExerciseOccupationDictionary = {
    intermediateOccupation: IntermediateOccupation,
    noOccupation: NoOccupation,
    loadOccupation: LoadOccupation,
    waitForTransferOccupation: WaitForTransferOccupation,
    unloadingOccupation: UnloadingOccupation,
    patientTransferOccupation: PatientTransferOccupation,
};

export const occupationTypeOptions: Parameters<typeof Type> = [
    () => Occupation,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(occupationDictionary).map(
                ([name, value]) => ({ name, value })
            ),
        },
    },
];

export const occupationToGermanDictionary: {
    [key in ExerciseOccupationType]: string;
} = {
    noOccupation: 'Nicht genutzt',
    intermediateOccupation: 'Wird übergeben',
    unloadingOccupation: 'Wird ausgeladen',
    loadOccupation: 'Wird beladen',
    waitForTransferOccupation: 'Wartet auf Transfer',
    patientTransferOccupation:
        'Wird einen Patienten zum Krankenhaus transportieren',
};
