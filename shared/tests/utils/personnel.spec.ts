import type { Personnel } from '../../src/models';
import {
    currentCoordinatesOf,
    isOnMap,
    SpatialTree,
} from '../../src/models/utils';
import type { ExerciseState } from '../../src/state';
import type { Mutable } from '../../src/utils';
import { cloneDeepMutable } from '../../src/utils';

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
