import Style from 'ol/style/Style';
import type OlMap from 'ol/Map';
import Icon from 'ol/style/Icon';
import { getTopRight } from 'ol/extent';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import type { View, MapBrowserEvent } from 'ol';
import { Feature } from 'ol';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type { UUID } from 'digital-fuesim-manv-shared';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { ApiService } from 'src/app/core/api.service';
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
        private readonly apiService: ApiService
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

    public onFeatureDrop(
        dropEvent: TranslateEvent,
        droppedFeature: Feature<any>,
        droppedOnFeature: Feature<Point>
    ) {
        const id = droppedFeature.getId() as UUID;
        const exerciseState = getStateSnapshot(this.store).exercise;
        // We expect the id to be globally unique
        if (exerciseState.patients[id]) {
            this.apiService.proposeAction({
                type: '[Patient] Remove patient',
                patientId: id,
            });
            return true;
        }
        if (exerciseState.vehicles[id]) {
            this.apiService.proposeAction({
                type: '[Vehicle] Remove vehicle',
                vehicleId: id,
            });
            return true;
        }
        if (exerciseState.mapImages[id]) {
            this.apiService.proposeAction({
                type: '[MapImage] Remove MapImage',
                mapImageId: id,
            });
            return true;
        }
        if (exerciseState.viewports[id]) {
            this.apiService.proposeAction({
                type: '[Viewport] Remove viewport',
                viewportId: id,
            });
            return true;
        }
        if (exerciseState.transferPoints[id]) {
            this.apiService.proposeAction({
                type: '[TransferPoint] Remove TransferPoint',
                transferPointId: id,
            });
            return true;
        }
        return false;
    }
}
