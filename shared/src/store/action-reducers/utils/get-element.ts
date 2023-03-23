import type {
    ExerciseSimulationActivityState,
    ExerciseSimulationBehaviorState,
} from '../../../simulation';
import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import type { ElementTypePluralMap } from '../../../utils/element-type-plural-map';
import { elementTypePluralMap } from '../../../utils/element-type-plural-map';
import { ReducerError } from '../../reducer-error';

/**
 * @returns The element with the given id
 * @throws ReducerError if the element does not exist
 */
export function getElement<
    ElementType extends keyof ElementTypePluralMap,
    State extends ExerciseState | Mutable<ExerciseState>
>(
    state: State,
    elementType: ElementType,
    elementId: UUID
): State[ElementTypePluralMap[ElementType]][UUID] {
    const element = state[elementTypePluralMap[elementType]][
        elementId
    ] as State[ElementTypePluralMap[ElementType]][UUID];
    if (!element) {
        throw new ReducerError(
            `Element of type ${elementType} with id ${elementId} does not exist`
        );
    }
    return element;
}

export function getElementByPredicate<
    ElementType extends keyof ElementTypePluralMap,
    State extends Mutable<ExerciseState>
>(
    state: State,
    elementType: ElementType,
    predicate: (
        element: State[ElementTypePluralMap[ElementType]][UUID]
    ) => boolean
): State[ElementTypePluralMap[ElementType]][UUID] {
    const element = Object.values(
        state[elementTypePluralMap[elementType]]
    ).find(predicate);
    if (!element) {
        throw new ReducerError(
            `Element of type ${elementType} matching the given predicate does not exist`
        );
    }
    return element;
}

export function getBehaviorById(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorId: UUID
): Mutable<ExerciseSimulationBehaviorState> {
    const simulatedRegion = getElement(
        state,
        'simulatedRegion',
        simulatedRegionId
    );
    const behavior = simulatedRegion.behaviors.find((b) => b.id === behaviorId);
    if (!behavior) {
        throw new ReducerError(
            `Behavior with id ${behaviorId} does not exist in simulated region ${simulatedRegionId}`
        );
    }
    return behavior;
}

export function getActivityById(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    activityId: UUID
): Mutable<ExerciseSimulationActivityState> {
    const simulatedRegion = getElement(
        state,
        'simulatedRegion',
        simulatedRegionId
    );
    const activity = simulatedRegion.activities[activityId];
    if (!activity) {
        throw new ReducerError(
            `Activity with id ${activityId} does not exist in simulated region ${simulatedRegionId}`
        );
    }
    return activity;
}
