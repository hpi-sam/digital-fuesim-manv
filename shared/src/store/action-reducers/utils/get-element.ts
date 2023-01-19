import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import type { TypeSelectorMap } from '../../../utils/type-state-selector-map';
import { typeSelectorMap } from '../../../utils/type-state-selector-map';
import { ReducerError } from '../../reducer-error';

/**
 * @returns The element with the given id
 * @throws ReducerError if the element does not exist
 */
export function getElement<
    ElementType extends keyof TypeSelectorMap,
    State extends ExerciseState | Mutable<ExerciseState>
>(
    state: State,
    elementType: ElementType,
    elementId: UUID
): State[TypeSelectorMap[ElementType]][UUID] {
    const element = state[typeSelectorMap[elementType]][
        elementId
    ] as State[TypeSelectorMap[ElementType]][UUID];
    if (!element) {
        throw new ReducerError(
            `Element of type ${elementType} with id ${elementId} does not exist`
        );
    }
    return element;
}
