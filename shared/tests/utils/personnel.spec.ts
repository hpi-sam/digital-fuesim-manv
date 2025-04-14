import type { Personnel } from '../../src/models/index.js';
import {
    currentCoordinatesOf,
    isOnMap,
    SpatialTree,
} from '../../src/models/utils/index.js';
import type { ExerciseState } from '../../src/state.js';
import type { Mutable } from '../../src/utils/index.js';
import { cloneDeepMutable } from '../../src/utils/index.js';

export function addPersonnel(
    state: Mutable<ExerciseState>,
    personnel: Personnel
) {
    const mutablePersonnel = cloneDeepMutable(personnel);
    if (isOnMap(mutablePersonnel)) {
        SpatialTree.addElement(
            state.spatialTrees.personnel,
            personnel.id,
            currentCoordinatesOf(personnel)
        );
    }
    state.personnel[personnel.id] = mutablePersonnel;
    return personnel;
}
