import type { ExerciseAction, ExerciseState } from 'digital-fuesim-manv-shared';
import { cloneDeepMutable } from 'digital-fuesim-manv-shared';
import type { ExerciseTimeline } from './time-travel-helper';

// TODO: REMOVE THIS WHOLE FILE WHEN THE SERVER ENDPOINT IS READY
let tempTimeLine: ExerciseTimeline | undefined;

export function addAction(action: ExerciseAction) {
    if (!tempTimeLine) {
        return;
    }
    tempTimeLine = {
        ...tempTimeLine,
        actionsWrappers: [
            ...tempTimeLine.actionsWrappers,
            {
                action: cloneDeepMutable(action),
                time: Date.now(),
            },
        ],
    };
}

export function setInitialState(initialState: ExerciseState) {
    tempTimeLine = {
        actionsWrappers: [],
        initialState,
    };
}

export async function getTimeLine() {
    return new Promise<ExerciseTimeline>((resolve) => {
        setTimeout(() => resolve(tempTimeLine!), 1000);
    });
}
