import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils';
import { IntermediateOccupation } from './intermediate-occupation';
import { Occupation } from './occupation';
import { NoOccupation } from './no-occupation';
import { LoadOccupation } from './load-occupation';

export const occupations = {
    IntermediateOccupation,
    NoOccupation,
    LoadOccupation,
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
