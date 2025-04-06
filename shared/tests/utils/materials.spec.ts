import { defaultMaterialTemplates } from '../../src/data/default-state/material-templates.js';
import { Material } from '../../src/models/index.js';
import type { Position } from '../../src/models/utils/index.js';
import {
    currentCoordinatesOf,
    isPositionOnMap,
    SpatialTree,
} from '../../src/models/utils/index.js';
import type { ExerciseState } from '../../src/state.js';
import type { Mutable } from '../../src/utils/index.js';
import { cloneDeepMutable, uuid } from '../../src/utils/index.js';

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
