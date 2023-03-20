import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { cloneDeepMutable } from '../../utils';
import type { ExerciseRadiogram } from './exercise-radiogram';

export function sendRadiogram(
    radiogram: ExerciseRadiogram,
    draftState: Mutable<ExerciseState>
) {
    const mutableRadiogram = cloneDeepMutable(radiogram);
    mutableRadiogram.transmissionTime = draftState.currentTime;
    draftState.radiograms[mutableRadiogram.id] = mutableRadiogram;
}
