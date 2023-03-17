import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils';
import { RadiogramAcceptedStatus } from './radiogram-accepted-status';
import { RadiogramDoneStatus } from './radiogram-done-status';
import { RadiogramStatus } from './radiogram-status';
import { RadiogramUnreadStatus } from './radiogram-unread-status';

export const radiogramStatus = {
    RadiogramAcceptedStatus,
    RadiogramDoneStatus,
    RadiogramUnreadStatus,
};

export type ExerciseRadiogramStatus = InstanceType<
    (typeof radiogramStatus)[keyof typeof radiogramStatus]
>;

type ExerciseRadiogramStatusDictionary = {
    [Status in ExerciseRadiogramStatus as Status['type']]: Constructor<Status>;
};

export const radiogramStatusDictionary: ExerciseRadiogramStatusDictionary = {
    acceptedRadiogramStatus: RadiogramAcceptedStatus,
    doneRadiogramStatus: RadiogramDoneStatus,
    unreadRadiogramStatus: RadiogramUnreadStatus,
};

export const radiogramStatusTypeOptions: Parameters<typeof Type> = [
    () => RadiogramStatus,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(radiogramStatusDictionary).map(
                ([name, value]) => ({ name, value })
            ),
        },
    },
];
