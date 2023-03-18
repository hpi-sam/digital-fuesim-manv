import { cloneDeep } from 'lodash-es';
import type { Migration } from './migration-functions';

export const refactorRectangularElementPositionsToCenter25: Migration = {
    action: (intermediaryState: any, action: any) => {
        switch (action.type) {
            case '[Viewport] Add viewport':
                migrateRectangularElement(action.viewport);
                break;
            case '[SimulatedRegion] Add simulated region':
                migrateRectangularElement(action.simulatedRegion);
                break;
            case '[Viewport] Move viewport': {
                const migratedViewport = cloneDeep(
                    intermediaryState.viewports[action.viewportId]!
                );
                migratePositionWithMigratedSize(
                    action.targetPosition,
                    migratedViewport.size
                );
                break;
            }
            case '[SimulatedRegion] Move simulated region': {
                const migratedSimulatedViewport = cloneDeep(
                    intermediaryState.simulatedRegions[
                        action.simulatedRegionId
                    ]!
                );
                migratePositionWithMigratedSize(
                    action.targetPosition,
                    migratedSimulatedViewport.size
                );
                break;
            }
            case '[Viewport] Resize viewport':
                migratePosition(
                    action.targetPosition,
                    cloneDeep(action.newSize)
                );
                migrateSize(action.newSize);
                break;
            case '[SimulatedRegion] Resize simulated region':
                migratePosition(
                    action.targetPosition,
                    cloneDeep(action.newSize)
                );
                migrateSize(action.newSize);
                break;
        }
        return true;
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

/**
 * Migrates the position of a rectangular element to the center of the element.
 * @param oldSize the size of the element before this migration
 */
function migratePosition(coordinates: any, oldSize: any) {
    // The position was previously the top-left corner of the rectangle if the width and height was positive.
    coordinates.x = coordinates.x + oldSize.width / 2;
    coordinates.y = coordinates.y - oldSize.height / 2;
}

/**
 * Migrates the position of a rectangular element to the center of the element.
 *
 * This migration is not accurate for previously "flipped" viewports (height and/or width was negative).
 * To catch this case, access to the size of the viewport before this migration would be required.
 *
 * @param migratedSize the size of the element after it had been migrated to the center
 */
function migratePositionWithMigratedSize(coordinates: any, migratedSize: any) {
    migratePosition(coordinates, migratedSize);
}

function migrateSize(size: any) {
    size.width = Math.abs(size.width);
    size.height = Math.abs(size.height);
}
