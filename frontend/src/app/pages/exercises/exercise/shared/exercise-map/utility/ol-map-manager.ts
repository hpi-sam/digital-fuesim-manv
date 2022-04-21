import type {
    ImmutableJsonObject,
    MergeIntersection,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import { Overlay, View } from 'ol';
import type Point from 'ol/geom/Point';
import {
    Translate,
    Modify,
    defaults as defaultInteractions,
} from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import {
    getselectViewport,
    getSelectWithPosition,
    selectCateringLines,
    selectMapImages,
} from 'src/app/state/exercise/exercise.selectors';
import OlMap from 'ol/Map';
import type { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import type { ApiService } from 'src/app/core/api.service';
import type { NgZone } from '@angular/core';
import type Geometry from 'ol/geom/Geometry';
import type LineString from 'ol/geom/LineString';
import { isEqual } from 'lodash-es';
import { platformModifierKeyOnly, primaryAction } from 'ol/events/condition';
import type { Coordinate } from 'ol/coordinate';
import type { Observable } from 'rxjs';
import {
    Subject,
    filter,
    debounceTime,
    startWith,
    pairwise,
    takeUntil,
} from 'rxjs';
import { startingPosition } from '../../starting-position';
import { MaterialFeatureManager } from '../feature-managers/material-feature-manager';
import { PatientFeatureManager } from '../feature-managers/patient-feature-manager';
import { PersonnelFeatureManager } from '../feature-managers/personnel-feature-manager';
import { VehicleFeatureManager } from '../feature-managers/vehicle-feature-manager';
import { CateringLinesFeatureManager } from '../feature-managers/catering-lines-feature-manager';
import { ViewportFeatureManager } from '../feature-managers/viewport-feature-manager';
import type { ElementManager } from '../feature-managers/element-manager';
import { TransferPointFeatureManager } from '../feature-managers/transfer-point-feature-manager';
import { MapImageFeatureManager } from '../feature-managers/map-images-feature-manager';
import { isTrainer } from '../../utility/is-trainer';
import { handleChanges } from './handle-changes';
import { TranslateHelper } from './translate-helper';
import type { OpenPopupOptions } from './popup-manager';
import type { FeatureManager } from './feature-manager';
import type { ModifyGeometry } from './modify-helper';
import { ModifyHelper } from './modify-helper';

/**
 * This class should run outside the Angular zone for performance reasons.
 */
export class OlMapManager {
    private readonly destroy$ = new Subject<void>();

    public readonly olMap: OlMap;
    /**
     * If this subject emits options, the specified popup should be toggled.
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
        VectorLayer<VectorSource>,
        FeatureManager<any>
    >();

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly openLayersContainer: HTMLDivElement,
        private readonly popoverContainer: HTMLDivElement,
        private readonly ngZone: NgZone
    ) {
        const _isTrainer = isTrainer(this.apiService, this.store);
        // Layers
        const satelliteLayer = this.createTileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            20
        );
        const transferPointLayer = this.createElementLayer();
        const vehicleLayer = this.createElementLayer(1000);
        const cateringLinesLayer = this.createElementLayer<LineString>();
        const patientLayer = this.createElementLayer();
        const personnelLayer = this.createElementLayer();
        const materialLayer = this.createElementLayer();
        const viewportLayer = this.createElementLayer<LineString>();
        const mapImagesLayer = this.createElementLayer(10_000);
        this.popupOverlay = new Overlay({
            element: this.popoverContainer,
        });

        // Interactions
        // The layers where elements can be translated by trainer and participant
        const alwaysTranslatableLayers = [
            vehicleLayer,
            patientLayer,
            personnelLayer,
            materialLayer,
        ];
        const translateInteraction = new Translate({
            layers: _isTrainer
                ? [
                      ...alwaysTranslatableLayers,
                      transferPointLayer,
                      mapImagesLayer,
                  ]
                : alwaysTranslatableLayers,
        });

        const defaultStyle = new Modify({ source: viewportLayer.getSource()! })
            .getOverlay()
            .getStyleFunction();

        const viewportModify = new Modify({
            source: viewportLayer.getSource()!,
            condition: (event) =>
                primaryAction(event) && platformModifierKeyOnly(event),
            deleteCondition: () => false,
            insertVertexCondition: () => false,
            style: (feature) => {
                (feature.get('features') as Feature[]).forEach(
                    (modifyFeature) => {
                        const modifyGeometry = modifyFeature.get(
                            'modifyGeometry'
                        ) as ModifyGeometry;
                        if (modifyGeometry) {
                            const point = (
                                feature.getGeometry() as Point
                            ).getCoordinates();

                            const corners =
                                modifyGeometry.geometry.getCoordinates();
                            let origin: Coordinate, corner: Coordinate;
                            switch (modifyGeometry.modifyCorner) {
                                case 'topLeft': {
                                    origin = corners[2];
                                    corner = corners[0];
                                    break;
                                }
                                case 'topRight': {
                                    origin = corners[3];
                                    corner = corners[1];
                                    break;
                                }
                                case 'bottomLeft': {
                                    origin = corners[1];
                                    corner = corners[3];
                                    break;
                                }
                                case 'bottomRight': {
                                    origin = corners[0];
                                    corner = corners[2];
                                    break;
                                }
                            }
                            modifyGeometry.geometry.scale(
                                (point[0] - origin[0]) /
                                    (corner[0] - origin[0]),
                                (origin[1] - point[1]) /
                                    (origin[1] - corner[1]),
                                origin
                            );
                        }
                    }
                );
                return defaultStyle!(feature, 123);
            },
        });

        const viewportTranslate = new Translate({
            layers: [viewportLayer],
            condition: (event) =>
                primaryAction(event) && !platformModifierKeyOnly(event),
            hitTolerance: 10,
        });

        // Clicking on an element should not trigger a drag event - use a `singleclick` interaction instead
        // Be aware that this means that not every `dragstart` event will have an accompanying `dragend` event
        translateInteraction.on('translateend', (event) => {
            if (isEqual(event.coordinate, event.startCoordinate)) {
                event.stopPropagation();
            }
        });
        viewportTranslate.on('translateend', (event) => {
            if (isEqual(event.coordinate, event.startCoordinate)) {
                event.stopPropagation();
            }
        });

        TranslateHelper.registerTranslateEvents(translateInteraction);
        TranslateHelper.registerTranslateEvents(viewportTranslate);
        ModifyHelper.registerModifyEvents(viewportModify);

        const alwaysInteractions = [translateInteraction];
        const interactions = _isTrainer
            ? [...alwaysInteractions, viewportTranslate, viewportModify]
            : alwaysInteractions;

        this.olMap = new OlMap({
            interactions: defaultInteractions().extend(interactions),
            target: this.openLayersContainer,
            // Note: The order of this array determines the order of the objects on the map.
            // The most bottom objects must be at the top of the array.
            layers: [
                satelliteLayer,
                mapImagesLayer,
                transferPointLayer,
                vehicleLayer,
                cateringLinesLayer,
                patientLayer,
                personnelLayer,
                materialLayer,
                viewportLayer,
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
        this.registerFeatureElementManager(
            new TransferPointFeatureManager(
                this.store,
                this.olMap,
                transferPointLayer,
                this.apiService
            ),
            this.store.select(getSelectWithPosition('transferPoints'))
        ).togglePopup$.subscribe(this.changePopup$);

        this.registerFeatureElementManager(
            new PatientFeatureManager(
                this.store,
                this.olMap,
                patientLayer,
                this.apiService
            ),
            this.store.select(getSelectWithPosition('patients'))
        ).togglePopup$.subscribe(this.changePopup$);

        this.registerFeatureElementManager(
            new VehicleFeatureManager(
                this.store,
                this.olMap,
                vehicleLayer,
                this.apiService
            ),
            this.store.select(getSelectWithPosition('vehicles'))
        ).togglePopup$.subscribe(this.changePopup$);

        this.registerFeatureElementManager(
            new PersonnelFeatureManager(
                this.store,
                this.olMap,
                personnelLayer,
                this.apiService
            ),
            this.store.select(getSelectWithPosition('personnel'))
        );

        this.registerFeatureElementManager(
            new MaterialFeatureManager(
                this.store,
                this.olMap,
                materialLayer,
                this.apiService
            ),
            this.store.select(getSelectWithPosition('materials'))
        );

        this.registerFeatureElementManager(
            new MapImageFeatureManager(
                this.store,
                this.olMap,
                mapImagesLayer,
                this.apiService
            ),
            this.store.select(selectMapImages)
        )
            .togglePopup$.pipe(
                // We only want to open the popup if the user is a trainer
                filter(() => _isTrainer)
            )
            .subscribe(this.changePopup$);

        this.registerFeatureElementManager(
            new CateringLinesFeatureManager(cateringLinesLayer),
            this.store.select(selectCateringLines)
        );

        this.registerFeatureElementManager(
            new ViewportFeatureManager(viewportLayer, this.apiService),
            this.store.select(getselectViewport('viewports'))
        );

        this.registerPopupTriggers(translateInteraction);
        this.registerDropHandler(translateInteraction);
    }

    private registerFeatureElementManager<
        Element extends ImmutableJsonObject,
        T extends MergeIntersection<
            ElementManager<Element, any, any> & FeatureManager<any>
        >
    >(
        featureManager: T,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        this.layerFeatureManagerDictionary.set(
            featureManager.layer,
            featureManager
        );
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
                        (element) => featureManager.onElementCreated(element),
                        (element) => featureManager.onElementDeleted(element),
                        (oldElement, newElement) =>
                            featureManager.onElementChanged(
                                oldElement,
                                newElement
                            )
                    );
                });
            });
        return featureManager;
    }

    private registerPopupTriggers(translateInteraction: Translate) {
        this.olMap.on('singleclick', (event) => {
            this.olMap.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
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

    private registerDropHandler(translateInteraction: Translate) {
        translateInteraction.on('translateend', (event) => {
            const pixel = this.olMap.getPixelFromCoordinate(event.coordinate);
            this.olMap.forEachFeatureAtPixel(pixel, (feature, layer) =>
                // we stop propagating the event as soon as the onFeatureDropped function returns true
                this.layerFeatureManagerDictionary
                    .get(layer as VectorLayer<VectorSource<Point>>)!
                    .onFeatureDrop(
                        event,
                        event.features.getArray()[0] as Feature<Point>,
                        feature as Feature<Point>
                    )
            );
        });
    }

    private setCursorStyle(cursorStyle: string) {
        this.olMap!.getTargetElement().style.cursor = cursorStyle;
    }

    /**
     * @param renderBuffer The size of the largest symbol, line width or label on the highest zoom level.
     */
    private createElementLayer<LayerGeometry extends Geometry = Point>(
        renderBuffer = 250
    ) {
        return new VectorLayer({
            // These two settings prevent clipping during animation/interaction but cause a performance hit -> disable if needed
            updateWhileAnimating: true,
            updateWhileInteracting: true,
            renderBuffer,
            source: new VectorSource<LayerGeometry>(),
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
