import type { ExerciseState } from '../../../state';
import { getElement } from '../../../store/action-reducers/utils';
import { updateTreatments } from '../../../store/action-reducers/utils/calculate-treatments';
import type { SpatialElementType } from '../../../store/action-reducers/utils/spatial-elements';
import {
    removeElementPosition,
    updateElementPosition,
} from '../../../store/action-reducers/utils/spatial-elements';
import type { Mutable, UUID } from '../../../utils';
import { cloneDeepMutable } from '../../../utils';
import type { Position } from './position';
import {
    coordinatesOfPosition,
    isPositionNotOnMap,
    isPositionOnMap,
    isNotOnMap,
    isOnMap,
} from './position-helpers';

type MutablePosition = Mutable<Position>;

interface WithMutablePosition {
    position: MutablePosition;
    type: MovableType;
}
interface WithMutablePositionAndId extends WithMutablePosition {
    id: UUID;
}
type MovableType =
    | 'alarmGroup'
    | 'client'
    | 'hospital'
    | 'mapImage'
    | 'material'
    | 'patient'
    | 'personnel'
    | 'simulatedRegion'
    | 'transferPoint'
    | 'vehicle'
    | 'viewport';

export function changePositionWithId(
    of: UUID,
    to: Position,
    type: MovableType,
    inState: Mutable<ExerciseState>
) {
    changePosition(getElement(inState, type, of) as any, to, inState);
}

export function changePosition(
    of: WithMutablePosition,
    to: Position,
    inState: Mutable<ExerciseState>
) {
    if (
        of.type === 'patient' ||
        of.type === 'personnel' ||
        of.type === 'material'
    ) {
        updateSpatialElementTree(
            of as WithMutablePositionAndId,
            to,
            of.type,
            inState
        );
        of.position = cloneDeepMutable(to);
        updateTreatments(inState, of as any);
        return;
    }
    of.position = cloneDeepMutable(to);
}

function updateSpatialElementTree(
    element: WithMutablePositionAndId,
    to: Position,
    type: SpatialElementType,
    state: Mutable<ExerciseState>
) {
    if (isOnMap(element) && isPositionOnMap(to)) {
        updateElementPosition(
            state,
            type,
            element.id,
            coordinatesOfPosition(to)
        );
    } else if (isOnMap(element) && isPositionNotOnMap(to)) {
        removeElementPosition(state, type, element.id);
    } else if (isNotOnMap(element) && isPositionOnMap(to)) {
        updateElementPosition(
            state,
            type,
            element.id,
            coordinatesOfPosition(to)
        );
    }
}
