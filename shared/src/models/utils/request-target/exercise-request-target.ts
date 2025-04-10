import type { Type } from 'class-transformer';
import { simulatedRegionRequestTarget } from './simulated-region.js';
import { traineesRequestTarget } from './trainees.js';
import { RequestTargetConfiguration } from './request-target.js';

export const requestTargets = {
    simulatedRegionRequestTarget,
    traineesRequestTarget,
};

export type ExerciseRequestTarget =
    (typeof requestTargets)[keyof typeof requestTargets];

export type ExerciseRequestTargetType = InstanceType<
    ExerciseRequestTarget['configuration']
>['type'];

type ExerciseRequestTargetDictionary = {
    [Target in ExerciseRequestTarget as InstanceType<
        Target['configuration']
    >['type']]: Target;
};

export type ExerciseRequestTargetConfiguration<
    T extends ExerciseRequestTargetType = ExerciseRequestTargetType,
> = InstanceType<ExerciseRequestTargetDictionary[T]['configuration']>;

export const requestTargetDictionary = Object.fromEntries(
    Object.values(requestTargets).map((target) => [
        new target.configuration().type,
        target,
    ])
) as ExerciseRequestTargetDictionary;

export const requestTargetTypeOptions: Parameters<typeof Type> = [
    () => RequestTargetConfiguration,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(requestTargetDictionary).map(
                ([name, value]) => ({ name, value: value.configuration })
            ),
        },
    },
];
