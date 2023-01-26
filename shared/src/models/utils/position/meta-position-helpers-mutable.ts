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
import type { MetaPosition } from './meta-position';
import {
    coordinatesOfMetaPosition,
    isMetaPositionNotOnMap,
    isMetaPositionOnMap,
    isNotOnMap,
    isOnMap,
} from './meta-position-helpers';

type MutableMetaPosition = Mutable<MetaPosition>;

interface WithMutableMetaPosition {
    metaPosition: MutableMetaPosition;
}
interface WithMutableMetaPositionAndId extends WithMutableMetaPosition {
    id: UUID;
}
type ElementType =
    | 'alarmGroups'
    | 'clients'
    | 'hospitals'
    | 'mapImages'
    | 'materials'
    | 'patients'
    | 'personnel'
    | 'simulatedRegions'
    | 'transferPoints'
    | 'vehicles'
    | 'viewports';

export function changePositionWithId(
    of: UUID,
    to: MetaPosition,
    type: ElementType,
    inState: Mutable<ExerciseState>
) {
    changePosition(
        getElement(inState, type, of) as any,
        to,
        type === 'personnel' || type === 'materials' || type === 'patients'
            ? type
            : false,
        inState
    );
}

export function changePosition(
    of: WithMutableMetaPosition,
    to: MetaPosition,
    type: SpatialElementType | false,
    inState: Mutable<ExerciseState>
) {
    if (type) {
        updateSpatialElementTree(
            of as WithMutableMetaPositionAndId,
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
    element: WithMutableMetaPositionAndId,
    to: MetaPosition,
    type: SpatialElementType,
    state: Mutable<ExerciseState>
) {
    if (isOnMap(element) && isMetaPositionOnMap(to)) {
        updateElementPosition(
            state,
            type,
            element.id,
            coordinatesOfMetaPosition(to)
        );
    } else if (isOnMap(element) && isMetaPositionNotOnMap(to)) {
        removeElementPosition(state, type, element.id);
    } else if (isNotOnMap(element) && isMetaPositionOnMap(to)) {
        updateElementPosition(
            state,
            type,
            element.id,
            coordinatesOfMetaPosition(to)
        );
    }
}
