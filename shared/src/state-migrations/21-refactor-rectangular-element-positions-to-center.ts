import { ExerciseAction } from '../store';
import type { Mutable } from '../utils';
import type { Migration } from './migration-functions';

export const refactorRectangularElementPositionsToCenter21: Migration = {
    actions: (_initialState, actions) => {
        for (const action of actions as Mutable<ExerciseAction>[]) {
            switch (action?.type) {
                case '[Viewport] Add viewport':
                    migrateRectangularElement(action.viewport);
                    break;
                case '[Viewport] Move viewport':
                case '[Viewport] Rename viewport':
                    // It would be too much work to migrate these actions, as we need the current viewport size to convert them
                    // This results in most replays having different viewport positions.
                    break;
            }
        }
    },
    state: (state: any) => {
        for (const viewport of Object.values(state.viewports)) {
            migrateRectangularElement(viewport);
        }
        for (const simulatedRegion of Object.values(state.simulatedRegions)) {
            migrateRectangularElement(simulatedRegion);
        }
    },
};

function migrateRectangularElement(viewport: any) {
    const { position, size } = viewport;
    if (position.type === 'coordinates') {
        // The position was previously the top-left corner of the rectangle if the width and height was positive.
        position.x = position.x + size.width / 2;
        position.y = position.y - size.height / 2;
    }
    size.width = Math.abs(size.width);
    size.height = Math.abs(size.height);
}
