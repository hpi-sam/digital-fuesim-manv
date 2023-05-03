import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils';
import { IntermediateOccupation } from './intermediate-occupation';
import { Occupation } from './occupation';
import { NoOccupation } from './no-occupation';
import { UnloadingOccupation } from './unloading-occupation';

export const occupations = {
    IntermediateOccupation,
    NoOccupation,
    UnloadingOccupation,
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
    unloadingOccupation: UnloadingOccupation,
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
