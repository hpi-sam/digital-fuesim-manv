import type { Feature } from 'ol';
import { primaryAction, shiftKeyOnly } from 'ol/events/condition';
import type { LineString, Point } from 'ol/geom';
import { Modify } from 'ol/interaction';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import type { CornerName, ModifyGeometry } from './modify-helper';

const originCornerDict: {
    [key in CornerName]: { originIndex: number; cornerIndex: number };
} = {
    bottomRight: { originIndex: 0, cornerIndex: 2 },
    bottomLeft: { originIndex: 1, cornerIndex: 3 },
    topLeft: { originIndex: 2, cornerIndex: 0 },
    topRight: { originIndex: 3, cornerIndex: 1 },
};

export function createViewportModify(
    viewportLayer: VectorLayer<VectorSource<LineString>>
): Modify {
    const defaultStyle = new Modify({ source: viewportLayer.getSource()! })
        .getOverlay()
        .getStyleFunction();
    return new Modify({
        source: viewportLayer.getSource()!,
        condition: (event) => primaryAction(event) && shiftKeyOnly(event),
        deleteCondition: () => false,
        insertVertexCondition: () => false,
        style: (feature) => {
            (feature.get('features') as Feature[]).forEach((modifyFeature) => {
                const modifyGeometry = modifyFeature.get(
                    'modifyGeometry'
                ) as ModifyGeometry;
                if (!modifyGeometry) {
                    return;
                }
                const mouseCoordinate = (
                    feature.getGeometry() as Point
                ).getCoordinates();

                const corners = modifyGeometry.geometry.getCoordinates();
                const { originIndex, cornerIndex } =
                    originCornerDict[modifyGeometry.modifyCorner];
                // The corners array must be big enough.
                if (
                    corners.length <= originIndex ||
                    corners.length <= cornerIndex
                ) {
                    throw new Error(
                        `corners must be at least as big to satisfy originIndex (${originIndex}) and cornerIndex (${cornerIndex}): ${corners}`
                    );
                }
                const origin = corners[originIndex]!;
                const corner = corners[cornerIndex]!;
                modifyGeometry.geometry.scale(
                    (mouseCoordinate[0]! - origin[0]!) /
                        (corner[0]! - origin[0]!),
                    (origin[1]! - mouseCoordinate[1]!) /
                        (origin[1]! - corner[1]!),
                    origin
                );
            });
            // This renders the default LineString style. The function ignores all arguments.
            return defaultStyle!(feature, 123);
        },
    });
}
