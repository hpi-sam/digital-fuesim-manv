import type { ExerciseState } from '../../../state';
import type { Mutable, UUID } from '../../../utils';
import { ReducerError } from '../../reducer-error';

/**
 * @returns The element with the given id
 * @throws ReducerError if the element does not exist
 */
export function getElement<
    ElementType extends
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
        | 'viewports',
    State extends ExerciseState | Mutable<ExerciseState>
>(
    state: State,
    elementType: ElementType,
    elementId: UUID
): State[ElementType][UUID] {
    const element = state[elementType][elementId] as State[ElementType][UUID];
    if (!element) {
        throw new ReducerError(
            `Element of type ${elementType} with id ${elementId} does not exist`
        );
    }
    return element;
}
