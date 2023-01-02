import type { Action } from '../store';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const addMapImageIsLocked11: Migration = {
    actions: (_initialState, actions) => {
        actions.forEach((action) => {
            if ((action as Action | null)?.type === '[MapImage] Add MapImage') {
                Object.assign((action as { mapImage: object }).mapImage, {
                    isLocked: false,
                });
            }
        });
    },
    state: (state) => {
        const typedState = state as {
            mapImages: { [key: UUID]: object };
        };
        Object.values(typedState.mapImages).forEach((mapImage) => {
            Object.assign(mapImage, { isLocked: false });
        });
    },
};
