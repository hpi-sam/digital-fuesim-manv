import type { Type } from 'class-transformer';
import type { Constructor } from '../../utils';
import { DummyRadiogram } from './dummy-radiogram';
import { Radiogram } from './radiogram';

export const radiograms = {
    DummyRadiogram,
};

export type ExerciseRadiogram = InstanceType<
    (typeof radiograms)[keyof typeof radiograms]
>;

type ExerciseRadiogramDictionary = {
    [Radiogram in ExerciseRadiogram as Radiogram['type']]: Constructor<Radiogram>;
};

export const radiogramDictionary: ExerciseRadiogramDictionary = {
    dummyRadiogram: DummyRadiogram,
};

export function getRadiogramConstructor(radiogram: ExerciseRadiogram) {
    return radiogramDictionary[radiogram.type];
}

export const radiogramTypeOptions: Parameters<typeof Type> = [
    () => Radiogram,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(radiogramDictionary).map(
                ([name, value]) => ({ name, value })
            ),
        },
    },
];
