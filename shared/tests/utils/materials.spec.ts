import { defaultMaterialTemplates } from '../../src/data/default-state/material-templates';
import { Material } from '../../src/models';
import type { Position } from '../../src/models/utils';
import {
    currentCoordinatesOf,
    isPositionOnMap,
    SpatialTree,
} from '../../src/models/utils';
import type { ExerciseState } from '../../src/state';
import type { Mutable } from '../../src/utils';
import { cloneDeepMutable, uuid } from '../../src/utils';

export function addMaterial(state: Mutable<ExerciseState>, position: Position) {
    const material = cloneDeepMutable(
        Material.generateMaterial(
            defaultMaterialTemplates.standard,
            uuid(),
            'RTW 3/83/1',
            position
        )
    );
    material.canCaterFor = {
        red: 1,
        yellow: 0,
        green: 0,
        logicalOperator: 'and',
    };
    if (isPositionOnMap(position)) {
        SpatialTree.addElement(
            state.spatialTrees.materials,
            material.id,
            currentCoordinatesOf(material)
        );
    }
    state.materials[material.id] = material;
    return material;
}
