import type { WithPosition } from 'src/app/shared/utility/types/with-position';
import type { AppState } from '../app.state';

export const selectViewports = (state: AppState) => state.exercise.viewports;

export const selectPatients = (state: AppState) => state.exercise.patients;
export const selectVehicles = (state: AppState) => state.exercise.vehicles;
export const selectPersonell = (state: AppState) => state.exercise.personell;
export const selectMaterials = (state: AppState) => state.exercise.materials;

/**
 * @returns a selector that returns an dictionary of all elements that have a position
 */
export function getSelectWithPosition<
    Key extends 'materials' | 'patients' | 'personell' | 'vehicles',
    Elements extends AppState['exercise'][Key] = AppState['exercise'][Key],
    ElementsWithPosition extends {
        [Id in keyof Elements]: WithPosition<Elements[Id]>;
    } = { [Id in keyof Elements]: WithPosition<Elements[Id]> }
>(key: Key) {
    return (state: AppState): ElementsWithPosition => {
        const dictionary = state.exercise[key];
        const elementsWithPosition: ElementsWithPosition = {} as any;
        for (const id in dictionary) {
            if (dictionary[id].position) {
                elementsWithPosition[id] = dictionary[id] as any;
            }
        }
        return elementsWithPosition;
    };
}
