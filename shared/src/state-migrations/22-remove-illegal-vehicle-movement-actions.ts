import { getElement } from '../store/action-reducers/utils';
import { isCompletelyLoaded } from '../store/action-reducers/utils/completely-load-vehicle';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

/**
 * We prevent users to perform some actions on vehicles to enforce the connection between personnel, material and vehicles.
 * Therefore, these action might become illegal. To keep most value of the exports, we delete these actions.
 * Some vehicles will thus stay on the map even though they had been send away in the original session.
 */
export const removeIllegalVehicleMovementActions22: Migration = {
    action: (intermediaryState: any, action) => {
        switch ((action as { type: string }).type) {
            case '[Hospital] Transport patient to hospital': {
                const { vehicleId } = action as { vehicleId: UUID };
                const vehicle = getElement(
                    intermediaryState,
                    'vehicle',
                    vehicleId
                );
                return isCompletelyLoaded(intermediaryState, vehicle);
            }
            case '[SimulatedRegion] Add Element': {
                const { elementToBeAddedType, elementToBeAddedId } = action as {
                    elementToBeAddedType: string;
                    elementToBeAddedId: UUID;
                };
                if (elementToBeAddedType === 'vehicle') {
                    const vehicle = getElement(
                        intermediaryState,
                        'vehicle',
                        elementToBeAddedId
                    );
                    return isCompletelyLoaded(intermediaryState, vehicle);
                }
            }
        }
        return true;
    },
    state: null,
};
