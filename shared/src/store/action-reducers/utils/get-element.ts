import type { ExerciseRadiogram } from '../../../models/radiogram';
import type {
    ExerciseSimulationActivityState,
    ExerciseSimulationActivityType,
    ExerciseSimulationBehaviorState,
    ExerciseSimulationBehaviorType,
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

export function getRadiogramById<R extends ExerciseRadiogram>(
    state: Mutable<ExerciseState>,
    radiogramId: UUID,
    radiogramType: R['type']
) {
    const radiogram = state.radiograms[radiogramId];
    if (!radiogram) {
        throw new ReducerError(
            `Radiogram with id ${radiogramId} does not exist`
        );
    }
    if (radiogram.type !== radiogramType) {
        throw new ReducerError(
            `Expected radiogram with id ${radiogramId} to be of type ${radiogramType}, but was ${radiogram.type}`
        );
    }
    return radiogram as Mutable<R>;
}

export function getBehaviorById<T extends ExerciseSimulationBehaviorType>(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorId: UUID,
    behaviorType: T
) {
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
    if (behavior.type !== behaviorType) {
        throw new ReducerError(
            `Expected behavior with id ${behaviorId} to be of type ${behaviorType}, but was ${behavior.type}`
        );
    }
    return behavior as Mutable<ExerciseSimulationBehaviorState<T>>;
}

export function getActivityById<T extends ExerciseSimulationActivityType>(
    state: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    activityId: UUID,
    activityType: T
) {
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
    if (activity.type !== activityType) {
        throw new ReducerError(
            `Expected activity with id ${activityId} to be of type ${activityType}, but was ${activity.type}`
        );
    }
    return activity as Mutable<ExerciseSimulationActivityState<T>>;
}
