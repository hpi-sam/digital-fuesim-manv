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
    metaPosition: MutablePosition;
}
interface WithMutablePositionAndId extends WithMutablePosition {
    id: UUID;
}
type ElementType =
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
    type: ElementType,
    inState: Mutable<ExerciseState>
) {
    changePosition(
        getElement(inState, type, of) as any,
        to,
        type === 'personnel' || type === 'material' || type === 'patient'
            ? type
            : false,
        inState
    );
}

export function changePosition(
    of: WithMutablePosition,
    to: Position,
    type: SpatialElementType | false,
    inState: Mutable<ExerciseState>
) {
    if (type) {
        updateSpatialElementTree(
            of as WithMutablePositionAndId,
            to,
            type,
            inState
        );
        of.metaPosition = cloneDeepMutable(to);
        updateTreatments(inState, of as any);
        return;
    }
    of.metaPosition = cloneDeepMutable(to);
}

function updateSpatialElementTree(
    element: WithMutablePositionAndId,
    to: Position,
    type: SpatialElementType,
    state: Mutable<ExerciseState>
) {
    console.log(type);

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
