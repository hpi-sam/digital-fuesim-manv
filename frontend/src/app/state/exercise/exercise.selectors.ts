import { pickBy } from 'lodash-es';
import type { WithPosition } from 'src/app/shared/utility/types/with-position';
import type { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;

export const selectPatients = (state: AppState) => state.exercise.patients;
export const selectVehicles = (state: AppState) => state.exercise.vehicles;
export const selectPersonell = (state: AppState) => state.exercise.personell;
export const selectMaterials = (state: AppState) => state.exercise.materials;

/**
 * @returns a selector that returns a dictionary of all elements that have a position
 */
// TODO: probably also include that the position is in a viewport in the future
export function getSelectWithPosition<
    Key extends 'materials' | 'patients' | 'personell' | 'vehicles',
    Elements extends AppState['exercise'][Key] = AppState['exercise'][Key],
    ElementsWithPosition extends {
        [Id in keyof Elements]: WithPosition<Elements[Id]>;
    } = { [Id in keyof Elements]: WithPosition<Elements[Id]> }
>(key: Key) {
    return (state: AppState): ElementsWithPosition =>
        pickBy(
            state.exercise[key],
            (element) => !!element.position
        ) as ElementsWithPosition;
}
