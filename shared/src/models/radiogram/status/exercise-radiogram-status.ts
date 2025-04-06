import type { Type } from 'class-transformer';
import type { Constructor } from '../../../utils/constructor.js';
import { RadiogramAcceptedStatus } from './radiogram-accepted-status.js';
import { RadiogramDoneStatus } from './radiogram-done-status.js';
import { RadiogramStatus } from './radiogram-status.js';
import { RadiogramUnpublishedStatus } from './radiogram-unpublished-status.js';
import { RadiogramUnreadStatus } from './radiogram-unread-status.js';

export const radiogramStatus = {
    RadiogramAcceptedStatus,
    RadiogramDoneStatus,
    RadiogramUnreadStatus,
    RadiogramUnpublishedStatus,
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
    unpublishedRadiogramStatus: RadiogramUnpublishedStatus,
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

export const radiogramStatusTypeToGermanDictionary: {
    [Key in ExerciseRadiogramStatus['type']]: string;
} = {
    acceptedRadiogramStatus: 'angenommen',
    doneRadiogramStatus: 'durchgesagt',
    unreadRadiogramStatus: 'veröffentlicht',
    unpublishedRadiogramStatus: 'noch nicht veröffentlicht',
};
