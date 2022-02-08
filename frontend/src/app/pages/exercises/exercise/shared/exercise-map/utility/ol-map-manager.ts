import type { UUID, Position } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import { Overlay, View } from 'ol';
import type Point from 'ol/geom/Point';
import { Translate, defaults as defaultInteractions } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import type { Observable } from 'rxjs';
import { debounceTime, startWith, Subject, pairwise, takeUntil } from 'rxjs';
import { getSelectWithPosition } from 'src/app/state/exercise/exercise.selectors';
import OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { ApiService } from 'src/app/core/api.service';
import type { NgZone } from '@angular/core';
import { startingPosition } from '../../starting-position';
import { MaterialFeatureManager } from '../feature-managers/material-feature-manager';
import { PatientFeatureManager } from '../feature-managers/patient-feature-manager';
import { PersonellFeatureManager } from '../feature-managers/personell-feature-manager';
import { VehicleFeatureManager } from '../feature-managers/vehicle-feature-manager';
import type { CommonFeatureManager } from '../feature-managers/common-feature-manager';
import { handleChanges } from './handle-changes';
import { TranslateHelper } from './translate-helper';
import type { OpenPopupOptions } from './popup-manager';

/**
 * This class should run outside the Angular zone for performance reasons.
 */
export class OlMapManager {
    private readonly destroy$ = new Subject<void>();

    public readonly olMap: OlMap;
    /**
     * If this subject emits options the specified popup should be toggled.
     * If it emits undefined, the currently open popup should be closed.
     */
    public readonly changePopup$ = new Subject<
        OpenPopupOptions<any> | undefined
    >();
    public readonly popupOverlay: Overlay;
    /**
     * key: the layer that is passed to the featureManager, that is saved in the value
     * ```ts
     * layerFeatureManagerDictionary.get(layer) === featureManager
     * // means that:
     * featureManager.layer === layer
     * ```
     */
    private readonly layerFeatureManagerDictionary = new Map<
        VectorLayer<VectorSource<Point>>,
        CommonFeatureManager<any, any>
    >();

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly openLayersContainer: HTMLDivElement,
        private readonly popoverContainer: HTMLDivElement,
        private readonly ngZone: NgZone
    ) {
        // Layers
        const satelliteLayer = this.createTileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            20
        );
        const patientLayer = this.createElementLayer();
        const vehicleLayer = this.createElementLayer();
        const personellLayer = this.createElementLayer();
        const materialLayer = this.createElementLayer();
        this.popupOverlay = new Overlay({
            element: this.popoverContainer,
        });

        // Interactions
        const translateInteraction = new Translate({
            layers: [patientLayer, vehicleLayer, personellLayer, materialLayer],
        });
        TranslateHelper.registerTranslateEvents(translateInteraction);

        this.olMap = new OlMap({
            interactions: defaultInteractions().extend([translateInteraction]),
            target: this.openLayersContainer,
            layers: [
                satelliteLayer,
                vehicleLayer,
                patientLayer,
                personellLayer,
                materialLayer,
            ],
            overlays: [this.popupOverlay],
            view: new View({
                center: [startingPosition.x, startingPosition.y],
                zoom: 20,
                maxZoom: 23,
            }),
        });

        // Cursors
        this.olMap.on('pointermove', (event) => {
            this.setCursorStyle(
                this.olMap!.hasFeatureAtPixel(event.pixel) ? 'pointer' : ''
            );
        });
        // TODO:
        // translateInteraction.on('translatestart', () => {
        //     this.setCursorStyle('grabbing');
        // });
        // translateInteraction.on('translateend', () => {
        //     this.setCursorStyle('');
        // });

        // FeatureManagers
        this.createAndRegisterFeatureManager(
            PatientFeatureManager,
            patientLayer,
            this.store.select(getSelectWithPosition('patients'))
        );
        this.createAndRegisterFeatureManager(
            VehicleFeatureManager,
            vehicleLayer,
            this.store.select(getSelectWithPosition('vehicles'))
        );
        this.createAndRegisterFeatureManager(
            PersonellFeatureManager,
            personellLayer,
            this.store.select(getSelectWithPosition('personell'))
        );
        this.createAndRegisterFeatureManager(
            MaterialFeatureManager,
            materialLayer,
            this.store.select(getSelectWithPosition('materials'))
        );

        this.registerPopupTriggers(translateInteraction);
    }

    // If the signature of the FeatureManager classes change, the initialisation should be done individually
    private createAndRegisterFeatureManager<
        Element extends Readonly<{ id: UUID; position: Position }>
    >(
        featureManagerClass:
            | typeof MaterialFeatureManager
            | typeof PatientFeatureManager
            | typeof PersonellFeatureManager
            | typeof VehicleFeatureManager,
        layer: VectorLayer<VectorSource<Point>>,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        const featureManager = new featureManagerClass(
            this.olMap!,
            layer,
            this.apiService
        );
        featureManager.togglePopup$.subscribe(this.changePopup$);
        this.layerFeatureManagerDictionary.set(layer, featureManager);
        // Propagate the changes on an element to the featureManager
        elementDictionary$
            .pipe(
                // TODO: this is workaround for not emitting synchronously
                // currently, the setState of the optimistic update and the actions that are reapplied each bring the state to synchronously emit
                debounceTime(0),
                startWith({}),
                pairwise(),
                takeUntil(this.destroy$)
            )
            .subscribe(([oldElementDictionary, newElementDictionary]) => {
                // run outside angular zone for better performance
                this.ngZone.runOutsideAngular(() => {
                    handleChanges(
                        oldElementDictionary,
                        newElementDictionary,
                        (element) =>
                            featureManager.onElementCreated(element as any),
                        (element) =>
                            featureManager.onElementDeleted(element as any),
                        (oldElement, newElement) =>
                            featureManager.onElementChanged(
                                oldElement as any,
                                newElement as any
                            )
                    );
                });
            });
    }

    private registerPopupTriggers(translateInteraction: Translate) {
        this.olMap.on('singleclick', (event) => {
            this.olMap!.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                this.layerFeatureManagerDictionary
                    .get(layer as VectorLayer<VectorSource<Point>>)!
                    .onFeatureClicked(event, feature as Feature<Point>);
                // we only want the top one -> a truthy return breaks this loop
                return true;
            });
            if (!this.olMap!.hasFeatureAtPixel(event.pixel)) {
                this.changePopup$.next(undefined);
            }
        });

        // Automatically close the popup
        translateInteraction.on('translating', (event) => {
            if (
                event.coordinate[0] === event.startCoordinate[0] &&
                event.coordinate[1] === event.startCoordinate[1]
            ) {
                return;
            }
            this.changePopup$.next(undefined);
        });
        this.olMap.getView().on(['change:resolution', 'change:center'], () => {
            this.changePopup$.next(undefined);
        });
    }

    private setCursorStyle(cursorStyle: string) {
        this.olMap!.getTargetElement().style.cursor = cursorStyle;
    }

    /**
     * @param renderBuffer The size of the largest symbol, line width or label on the highest zoom level.
     */
    private createElementLayer(renderBuffer = 250) {
        return new VectorLayer({
            // These two settings prevent clipping during animation/interaction but cause a performance hit -> disable if needed
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            renderBuffer,
            source: new VectorSource<Point>(),
        });
    }

    /**
     * @param url the url to the server that serves the tiles. Must include `{x}`, `{y}` or `{-y}` and `{z}`placeholders.
     * @param maxZoom The maximum `{z}` value the tile server accepts
     */
    private createTileLayer(url: string, maxZoom: number) {
        return new TileLayer({
            source: new XYZ({
                url,
                maxZoom,
                // We want to keep the tiles cached if we are zooming in and out fast
                cacheSize: 1000,
            }),
        });
    }

    public destroy() {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
