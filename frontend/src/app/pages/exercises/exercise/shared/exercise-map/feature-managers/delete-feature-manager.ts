import type { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { MapBrowserEvent, View } from 'ol';
import { Feature } from 'ol';
import { getTopRight } from 'ol/extent';
import { Point } from 'ol/geom';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type VectorLayer from 'ol/layer/Vector';
import type OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import type { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectExerciseState } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { FeatureManager } from '../utility/feature-manager';

function calculateTopRightViewPoint(view: View) {
    const extent = getTopRight(view.calculateExtent());
    return new Point([extent[0]!, extent[1]!]);
}

export class DeleteFeatureManager implements FeatureManager<Feature<Point>> {
    constructor(
        private readonly store: Store<AppState>,
        public readonly layer: VectorLayer<VectorSource<Point>>,
        private readonly olMap: OlMap,
        private readonly exerciseService: ExerciseService
    ) {
        this.layer.setStyle(
            new Style({
                image: new Icon({
                    opacity: 0.8,
                    anchorOrigin: 'top-right',
                    anchor: [-0.25, -0.25],
                    src: '/assets/trash-can.svg',
                    scale: 3,
                }),
            })
        );
        const view = this.olMap.getView();
        const point = calculateTopRightViewPoint(view);
        const deleteFeature = new Feature(point);
        this.layer.getSource()!.addFeature(deleteFeature);
        view.on(['change:resolution', 'change:center'], () => {
            deleteFeature.setGeometry(
                calculateTopRightViewPoint(this.olMap.getView())
            );
        });
    }
    public onFeatureClicked(
        event: MapBrowserEvent<any>,
        feature: Feature<any>
        // eslint-disable-next-line @typescript-eslint/no-empty-function
    ): void {}

    public isFeatureTranslatable(feature: Feature<Point>) {
        return false;
    }

    public onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<Point>
    ) {
        const id = droppedFeature.getId() as UUID;
        const exerciseState = selectStateSnapshot(
            selectExerciseState,
            this.store
        );
        // We expect the id to be globally unique
        if (exerciseState.patients[id]) {
            this.exerciseService.proposeAction({
                type: '[Patient] Remove patient',
                patientId: id,
            });
            return true;
        }
        if (exerciseState.vehicles[id]) {
            this.exerciseService.proposeAction({
                type: '[Vehicle] Remove vehicle',
                vehicleId: id,
            });
            return true;
        }
        if (exerciseState.mapImages[id]) {
            this.exerciseService.proposeAction({
                type: '[MapImage] Remove MapImage',
                mapImageId: id,
            });
            return true;
        }
        if (exerciseState.viewports[id]) {
            this.exerciseService.proposeAction({
                type: '[Viewport] Remove viewport',
                viewportId: id,
            });
            return true;
        }
        if (exerciseState.transferPoints[id]) {
            this.exerciseService.proposeAction({
                type: '[TransferPoint] Remove TransferPoint',
                transferPointId: id,
            });
            return true;
        }
        if (exerciseState.simulatedRegions[id]) {
            this.exerciseService.proposeAction({
                type: '[SimulatedRegion] Remove simulated region',
                simulatedRegionId: id,
            });
            return true;
        }
        return false;
    }
}
