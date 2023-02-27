import { defaultPersonnelTemplates } from '../../src/data/default-state/personnel-templates';
import { Personnel } from '../../src/models';
import type { Position } from '../../src/models/utils';
import {
    currentCoordinatesOf,
    isPositionOnMap,
    SpatialTree,
} from '../../src/models/utils';
import type { ExerciseState } from '../../src/state';
import type { Mutable } from '../../src/utils';
import { cloneDeepMutable, uuid } from '../../src/utils';

export function addPersonnel(
    state: Mutable<ExerciseState>,
    position: Position
) {
    const personnel = cloneDeepMutable(
        Personnel.generatePersonnel(
            defaultPersonnelTemplates.notSan,
            uuid(),
            'RTW 3/83/1',
            position
        )
    );
    personnel.canCaterFor = {
        red: 1,
        yellow: 0,
        green: 0,
        logicalOperator: 'and',
    };
    if (isPositionOnMap(position)) {
        SpatialTree.addElement(
            state.spatialTrees.personnel,
            personnel.id,
            currentCoordinatesOf(personnel)
        );
    }
    state.personnel[personnel.id] = personnel;
    return personnel;
}
