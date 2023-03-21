import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { takeUntil } from 'rxjs';
import type { StoreService } from 'src/app/core/store.service';
import { selectTileMapProperties } from 'src/app/state/application/selectors/exercise.selectors';

export class SatelliteLayerManager {
    private readonly _satelliteLayer: TileLayer<XYZ>;

    public get satelliteLayer(): TileLayer<XYZ> {
        return this._satelliteLayer;
    }

    constructor(
        private readonly storeService: StoreService,
        private readonly destroy$: any
    ) {
        this._satelliteLayer = new TileLayer({
            preload: Number.POSITIVE_INFINITY,
        });
        this.storeService
            .select$(selectTileMapProperties)
            .pipe(takeUntil(this.destroy$))
            .subscribe((tileMapProperties) => {
                this._satelliteLayer.setSource(
                    new XYZ({
                        url: tileMapProperties.tileUrl,
                        maxZoom: tileMapProperties.maxZoom,
                        // We want to keep the tiles cached if we are zooming in and out fast
                        cacheSize: 1000,
                    })
                );
            });
    }
}
