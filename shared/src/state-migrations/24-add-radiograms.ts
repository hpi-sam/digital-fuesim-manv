import type { ExerciseRadiogram } from '../models/radiogram/exercise-radiogram';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addRadiograms24: Migration = {
    action: null,
    state: (state) => {
        const typedState = state as {
            radiograms?: { [key: UUID]: ExerciseRadiogram };
        };
        typedState.radiograms = {};
    },
};
