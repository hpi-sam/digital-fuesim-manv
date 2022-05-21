import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { ReducerError } from '../../reducer-error';

/**
 * @returns The element with the given id
 * @throws ReducerError if the element does not exist
 */
export function getElement<
    ElementType extends
        | 'clients'
        | 'hospitals'
        | 'mapImages'
        | 'materials'
        | 'patients'
        | 'personnel'
        | 'transferPoints'
        | 'vehicles'
        | 'viewports'
>(
    state: Mutable<ExerciseState>,
    elementType: ElementType,
    elementId: UUID
): Mutable<ExerciseState>[ElementType][UUID] {
    const element = state[elementType][
        elementId
    ] as Mutable<ExerciseState>[ElementType][UUID];
    if (!element) {
        throw new ReducerError(
            `Element of type ${elementType} with id ${elementId} does not exist`
        );
    }
    return element;
}
