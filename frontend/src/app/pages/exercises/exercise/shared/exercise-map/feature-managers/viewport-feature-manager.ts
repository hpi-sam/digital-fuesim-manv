import type { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { Position, Size, Viewport } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type { Coordinate } from 'ol/coordinate';
import type { Polygon } from 'ol/geom';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { ViewportPopupComponent } from '../shared/viewport-popup/viewport-popup.component';
import { calculatePopupPositioning } from '../utility/calculate-popup-positioning';
import type { FeatureManager } from '../utility/feature-manager';
import { PolygonGeometryHelper } from '../utility/polygon-geometry-helper';
import { ResizeRectangleInteraction } from '../utility/resize-rectangle-interaction';
import { MoveableFeatureManager } from './moveable-feature-manager';

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
    extends MoveableFeatureManager<Viewport, Polygon>
    implements FeatureManager<Polygon>
{
    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<Polygon>>,
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {
        super(
            olMap,
            layer,
            (targetPositions, viewport) => {
                exerciseService.proposeAction({
                    type: '[Viewport] Move viewport',
                    viewportId: viewport.id,
                    targetPosition: targetPositions[0]![0]!,
                });
            },
            new PolygonGeometryHelper()
        );
        this.layer.setStyle(this.style);
    }

    private readonly style = new Style({
        fill: undefined,
        stroke: new Stroke({
            color: '#fafaff',
            width: 2,
        }),
    });

    override createFeature(element: Viewport): Feature<Polygon> {
        const feature = super.createFeature(element);
        ResizeRectangleInteraction.onResize(
            feature,
            ({ topLeftCoordinate, scale }) => {
                const currentElement = this.getElementFromFeature(
                    feature
                ) as Viewport;
                this.exerciseService.proposeAction(
                    {
                        type: '[Viewport] Resize viewport',
                        viewportId: element.id,
                        targetPosition: Position.create(
                            topLeftCoordinate[0]!,
                            topLeftCoordinate[1]!
                        ),
                        newSize: Size.create(
                            currentElement.size.width * scale.x,
                            currentElement.size.height * scale.y
                        ),
                    },
                    true
                );
            }
        );
        return feature;
    }

    override changeFeature(
        oldElement: Viewport,
        newElement: Viewport,
        changedProperties: ReadonlySet<keyof Viewport>,
        elementFeature: Feature<Polygon>
    ): void {
        if (
            changedProperties.has('position') ||
            changedProperties.has('size')
        ) {
            this.movementAnimator.animateFeatureMovement(
                elementFeature,
                this.geometryHelper.getElementCoordinates(newElement)
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
        if (selectStateSnapshot(selectCurrentRole, this.store) !== 'trainer') {
            return;
        }
        const zoom = this.olMap.getView().getZoom()!;
        const margin = 10 / zoom;

        this.togglePopup$.next({
            component: ViewportPopupComponent,
            context: {
                viewportId: feature.getId() as UUID,
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

    public override isFeatureTranslatable(feature: Feature<Polygon>): boolean {
        return selectStateSnapshot(selectCurrentRole, this.store) === 'trainer';
    }
}
