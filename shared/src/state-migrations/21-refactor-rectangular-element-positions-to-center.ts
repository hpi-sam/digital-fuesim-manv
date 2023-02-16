import { cloneDeep } from 'lodash-es';
import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const refactorRectangularElementPositionsToCenter21: Migration = {
    actions: (_initialState, actions) => {
        const oldViewportSizes: {
            [viewportId: UUID]: {
                width: number;
                height: number;
            };
        } = {};
        for (const action of actions as any) {
            switch (action?.type) {
                case '[Viewport] Add viewport':
                    if (action.viewport.position.type === 'coordinates') {
                        oldViewportSizes[action.viewport.id] = cloneDeep(
                            action.viewport.size
                        );
                    }
                    migrateRectangularElement(action.viewport);
                    break;
                case '[Viewport] Move viewport': {
                    const oldViewportSize = oldViewportSizes[action.viewportId];
                    if (oldViewportSize) {
                        migratePosition(action.targetPosition, oldViewportSize);
                    }
                    break;
                }
                case '[Viewport] Resize viewport': {
                    const oldViewportSize = cloneDeep(action.newSize);
                    oldViewportSizes[action.viewportId] = oldViewportSize;
                    migratePosition(action.targetPosition, oldViewportSize);
                    migrateSize(action.newSize);
                    break;
                }
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

function migrateRectangularElement(element: any) {
    const { position, size } = element;
    if (position.type === 'coordinates') {
        migratePosition(position.coordinates, size);
    }
    migrateSize(size);
}

function migratePosition(position: any, oldSize: any) {
    // The position was previously the top-left corner of the rectangle if the width and height was positive.
    position.x = position.x + oldSize.width / 2;
    position.y = position.y - oldSize.height / 2;
}

function migrateSize(size: any) {
    size.width = Math.abs(size.width);
    size.height = Math.abs(size.height);
}
