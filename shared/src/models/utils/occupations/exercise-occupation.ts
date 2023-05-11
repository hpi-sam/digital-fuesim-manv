import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils';
import { IntermediateOccupation } from './intermediate-occupation';
import { Occupation } from './occupation';
import { NoOccupation } from './no-occupation';
import { LoadOccupation } from './load-occupation';
import { WaitForTransferOccupation } from './wait-for-transfer-occupation';
import { UnloadingOccupation } from './unloading-occupation';
import { PatientTransferOccupation } from './patient-transfer-occupation';

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
