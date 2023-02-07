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
