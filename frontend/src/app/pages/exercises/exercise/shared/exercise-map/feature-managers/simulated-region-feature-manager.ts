import type { Store } from '@ngrx/store';
import type { UUID, SimulatedRegion } from 'digital-fuesim-manv-shared';
import { Position, Size } from 'digital-fuesim-manv-shared';
import type { Feature, MapBrowserEvent } from 'ol';
import type LineString from 'ol/geom/LineString';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { SimulatedRegionPopupComponent } from '../shared/simulated-region-popup/simulated-region-popup.component';
import { calculatePopupPositioning } from '../utility/calculate-popup-positioning';
import type { FeatureManager } from '../utility/feature-manager';
import { ResizeRectangleInteraction } from '../utility/resize-rectangle-interaction';
import {
    createLineString,
    ElementFeatureManager,
    getCoordinateArray,
} from './element-feature-manager';

export class SimulatedRegionFeatureManager
    extends ElementFeatureManager<SimulatedRegion, LineString>
    implements FeatureManager<Feature<LineString>>
{
    readonly type = 'simulatedRegions';

    override unsupportedChangeProperties = new Set(['id'] as const);

    constructor(
        olMap: OlMap,
        layer: VectorLayer<VectorSource<LineString>>,
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {
        super(
            olMap,
            layer,
            (targetPositions, simulatedRegion) => {
                exerciseService.proposeAction({
                    type: '[SimulatedRegion] Move simulated region',
                    simulatedRegionId: simulatedRegion.id,
                    targetPosition: targetPositions[0]!,
                });
            },
            createLineString
        );
        this.layer.setStyle(this.style);
    }

    private readonly style = new Style({
        stroke: new Stroke({
            color: '#cccc00',
            width: 2,
        }),
    });

    override createFeature(element: SimulatedRegion): Feature<LineString> {
        const feature = super.createFeature(element);
        ResizeRectangleInteraction.onResize(
            feature,
            ({ topLeftCoordinate, scale }) => {
                const currentElement = this.getElementFromFeature(feature)!
                    .value as SimulatedRegion;
                this.exerciseService.proposeAction(
                    {
                        type: '[SimulatedRegion] Resize simulated region',
                        simulatedRegionId: element.id,
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
        oldElement: SimulatedRegion,
        newElement: SimulatedRegion,
        changedProperties: ReadonlySet<keyof SimulatedRegion>,
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
        if (selectStateSnapshot(selectCurrentRole, this.store) !== 'trainer') {
            return;
        }
        const zoom = this.olMap.getView().getZoom()!;
        const margin = 10 / zoom;

        this.togglePopup$.next({
            component: SimulatedRegionPopupComponent,
            context: {
                simulatedRegionId: feature.getId() as UUID,
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

    public override isFeatureTranslatable(
        feature: Feature<LineString>
    ): boolean {
        return selectStateSnapshot(selectCurrentRole, this.store) === 'trainer';
    }
}
