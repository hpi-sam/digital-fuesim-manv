import type { Store } from '@ngrx/store';
import type { Feature, MapBrowserEvent } from 'ol';
import { Viewport, Size } from 'digital-fuesim-manv-shared';
import type OlMap from 'ol/Map';
import type LineString from 'ol/geom/LineString';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import type { Coordinate } from 'ol/coordinate';
import type { FeatureManager } from '../utility/feature-manager';
import { ModifyHelper } from '../utility/modify-helper';
import { ViewportPopupComponent } from '../shared/viewport-popup/viewport-popup.component';
import { calculatePopupPositioning } from '../utility/calculate-popup-positioning';
import {
    ElementFeatureManager,
    createLineString,
    getCoordinateArray,
} from './element-feature-manager';

export function isInViewport(
    coordinate: Coordinate,
    viewport: Viewport
): boolean {
    return Viewport.isInViewport(viewport, {
        x: coordinate[0]!,
        y: coordinate[1]!,
    });
}

export class ViewportFeatureManager
    extends ElementFeatureManager<Viewport, LineString>
    implements FeatureManager<Feature<LineString>>
{
    override unsupportedChangeProperties = new Set(['id'] as const);

    constructor(
        store: Store<AppState>,
        olMap: OlMap,
        layer: VectorLayer<VectorSource<LineString>>,
        private readonly apiService: ApiService
    ) {
        super(
            store,
            olMap,
            layer,
            (targetPositions, viewport) => {
                // We need at least on targetPosition
                if (targetPositions.length < 1) {
                    throw new Error(
                        'Got unexpectedly empty targetPositions array'
                    );
                }
                apiService.proposeAction({
                    type: '[Viewport] Move viewport',
                    viewportId: viewport.id,
                    targetPosition: targetPositions[0]!,
                });
            },
            createLineString
        );
        this.layer.setStyle(this.style);
    }
    private readonly modifyHelper = new ModifyHelper();

    private readonly style = new Style({
        geometry(thisFeature) {
            const modifyGeometry = thisFeature.get('modifyGeometry');
            return modifyGeometry
                ? modifyGeometry.geometry
                : thisFeature.getGeometry();
        },
        stroke: new Stroke({
            color: '#fafaff',
            width: 2,
        }),
    });

    override createFeature(element: Viewport): Feature<LineString> {
        const feature = super.createFeature(element);
        this.modifyHelper.onModifyEnd(feature, (newPositions) => {
            // We need at least 3 coordinates as `newPositions`
            if (newPositions.length < 3) {
                throw new Error(
                    `Got unexpectedly short newPositions array: ${newPositions}`
                );
            }
            // Skip when not all coordinates are properly set.
            if (
                !newPositions.every(
                    (position) =>
                        Number.isFinite(position.x) &&
                        Number.isFinite(position.y)
                )
            ) {
                const viewport = this.getElementFromFeature(feature)!.value;
                this.recreateFeature(viewport);
                return;
            }
            const lineString = newPositions;

            const topLeft = lineString[0]!;
            const bottomRight = lineString[2]!;
            this.apiService.proposeAction({
                type: '[Viewport] Resize viewport',
                viewportId: element.id,
                targetPosition: topLeft,
                newSize: Size.create(
                    bottomRight.x - topLeft.x,
                    topLeft.y - bottomRight.y
                ),
            });
        });
        return feature;
    }

    override changeFeature(
        oldElement: Viewport,
        newElement: Viewport,
        changedProperties: ReadonlySet<keyof Viewport>,
        elementFeature: Feature<LineString>
    ): void {
        if (
            changedProperties.has('position') ||
            changedProperties.has('size')
        ) {
            const newFeature = this.getFeatureFromElement(newElement);
            if (!newFeature) {
                throw new TypeError('newFeature undefined');
            }
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                getCoordinateArray(newElement)
            );
        }
        // If the style has updated, we need to redraw the feature
        elementFeature.changed();
    }

    public override onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
    ): void {
        super.onFeatureClicked(event, feature);
        if (this.apiService.getCurrentRole() !== 'trainer') {
            return;
        }
        const zoom = this.olMap.getView().getZoom()!;
        const margin = 10 / zoom;

        this.togglePopup$.next({
            component: ViewportPopupComponent,
            context: {
                viewportId: feature.getId() as string,
            },
            // We want the popup to be centered on the mouse position
            ...calculatePopupPositioning(
                event.coordinate,
                {
                    height: margin,
                    width: margin,
                },
                this.olMap.getView().getCenter()!
            ),
        });
    }
}
