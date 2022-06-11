import type { NgZone } from '@angular/core';
import type { Store } from '@ngrx/store';
import type {
    ImmutableJsonObject,
    MergeIntersection,
    UUID,
} from 'digital-fuesim-manv-shared';
import { isEqual } from 'lodash-es';
import type { Feature } from 'ol';
import { Overlay, View } from 'ol';
import { primaryAction, shiftKeyOnly } from 'ol/events/condition';
import type Geometry from 'ol/geom/Geometry';
import type LineString from 'ol/geom/LineString';
import type Point from 'ol/geom/Point';
import { defaults as defaultInteractions, Translate } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import type { Observable } from 'rxjs';
import { combineLatest, pairwise, startWith, Subject, takeUntil } from 'rxjs';
import type { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectRestrictedViewport,
    getSelectVisibleElements,
    selectCateringLines,
    selectExerciseStatus,
    selectMapImages,
    selectTileMapProperties,
    selectTransferLines,
    selectViewports,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { TransferLinesService } from '../../core/transfer-lines.service';
import { startingPosition } from '../../starting-position';
import { CateringLinesFeatureManager } from '../feature-managers/catering-lines-feature-manager';
import { DeleteFeatureManager } from '../feature-managers/delete-feature-manager';
import type { ElementManager } from '../feature-managers/element-manager';
import { MapImageFeatureManager } from '../feature-managers/map-images-feature-manager';
import { MaterialFeatureManager } from '../feature-managers/material-feature-manager';
import { PatientFeatureManager } from '../feature-managers/patient-feature-manager';
import { PersonnelFeatureManager } from '../feature-managers/personnel-feature-manager';
import { TransferLinesFeatureManager } from '../feature-managers/transfer-lines-feature-manager';
import { TransferPointFeatureManager } from '../feature-managers/transfer-point-feature-manager';
import { VehicleFeatureManager } from '../feature-managers/vehicle-feature-manager';
import {
    isInViewport,
    ViewportFeatureManager,
} from '../feature-managers/viewport-feature-manager';
import type { FeatureManager } from './feature-manager';
import { handleChanges } from './handle-changes';
import { ModifyHelper } from './modify-helper';
import type { OpenPopupOptions } from './popup-manager';
import { TranslateHelper } from './translate-helper';
import { createViewportModify } from './viewport-modify';

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

    private static readonly defaultZoom = 20;

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly openLayersContainer: HTMLDivElement,
        private readonly popoverContainer: HTMLDivElement,
        private readonly ngZone: NgZone,
        transferLinesService: TransferLinesService
    ) {
        // Layers
        const satelliteLayer = new TileLayer();
        this.store
            .select(selectTileMapProperties)
            .pipe(takeUntil(this.destroy$))
            .subscribe((tileMapProperties) => {
                satelliteLayer.setSource(
                    new XYZ({
                        url: tileMapProperties.tileUrl,
                        maxZoom: tileMapProperties.maxZoom,
                        // We want to keep the tiles cached if we are zooming in and out fast
                        cacheSize: 1000,
                    })
                );
            });
        const transferPointLayer = this.createElementLayer(600);
        const vehicleLayer = this.createElementLayer(1000);
        const cateringLinesLayer = this.createElementLayer<LineString>();
        const transferLinesLayer = this.createElementLayer<LineString>();
        const patientLayer = this.createElementLayer();
        const personnelLayer = this.createElementLayer();
        const materialLayer = this.createElementLayer();
        const viewportLayer = this.createElementLayer<LineString>();
        const mapImagesLayer = this.createElementLayer(10_000);
        const deleteFeatureLayer = this.createElementLayer();
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
            layers:
                this.apiService.getCurrentRole() === 'trainer'
                    ? [
                          ...alwaysTranslatableLayers,
                          transferPointLayer,
                          mapImagesLayer,
                      ]
                    : alwaysTranslatableLayers,
            hitTolerance: 10,
        });

        const viewportModify = createViewportModify(viewportLayer);

        const viewportTranslate = new Translate({
            layers: [viewportLayer],
            condition: (event) => primaryAction(event) && !shiftKeyOnly(event),
            hitTolerance: 10,
        });

        // Clicking on an element should not trigger a drag event - use a `singleclick` interaction instead
        // Be aware that this means that not every `dragstart` event will have an accompanying `dragend` event
        const registerTranslate = (translate: Translate) =>
            translate.on('translateend', (event) => {
                if (isEqual(event.coordinate, event.startCoordinate)) {
                    event.stopPropagation();
                }
            });
        registerTranslate(translateInteraction);
        registerTranslate(viewportTranslate);

        TranslateHelper.registerTranslateEvents(translateInteraction);
        TranslateHelper.registerTranslateEvents(viewportTranslate);
        ModifyHelper.registerModifyEvents(viewportModify);

        const alwaysInteractions = [translateInteraction];
        const customInteractions =
            this.apiService.getCurrentRole() === 'trainer'
                ? [...alwaysInteractions, viewportTranslate, viewportModify]
                : alwaysInteractions;

        this.olMap = new OlMap({
            interactions: defaultInteractions({
                pinchRotate: false,
                altShiftDragRotate: false,
                keyboard: true,
            }).extend(customInteractions),
            // We use Angular buttons instead
            controls: [],
            target: this.openLayersContainer,
            // Note: The order of this array determines the order of the objects on the map.
            // The most bottom objects must be at the top of the array.
            layers: [
                satelliteLayer,
                deleteFeatureLayer,
                mapImagesLayer,
                transferLinesLayer,
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
                zoom: OlMapManager.defaultZoom,
                maxZoom: 23,
                smoothExtentConstraint: false,
                smoothResolutionConstraint: false,
                constrainRotation: 1,
            }),
        });

        // Cursors
        this.olMap.on('pointermove', (event) => {
            this.setCursorStyle(
                this.olMap!.hasFeatureAtPixel(event.pixel) ? 'pointer' : ''
            );
        });

        // FeatureManagers
        if (this.apiService.getCurrentRole() === 'trainer') {
            this.registerFeatureElementManager(
                new TransferLinesFeatureManager(transferLinesLayer),
                this.store.select(selectTransferLines)
            );
            transferLinesService.displayTransferLines$.subscribe((display) => {
                transferLinesLayer.setVisible(display);
            });

            const deleteHelper = new DeleteFeatureManager(
                this.store,
                deleteFeatureLayer,
                this.olMap,
                this.apiService
            );
            this.layerFeatureManagerDictionary.set(
                deleteFeatureLayer,
                deleteHelper
            );
        }
        this.registerFeatureElementManager(
            new TransferPointFeatureManager(
                this.store,
                this.olMap,
                transferPointLayer,
                this.apiService
            ),
            this.store.select(
                getSelectVisibleElements(
                    'transferPoints',
                    this.apiService.ownClientId
                )
            )
        );

        this.registerFeatureElementManager(
            new PatientFeatureManager(
                this.store,
                this.olMap,
                patientLayer,
                this.apiService
            ),
            this.store.select(
                getSelectVisibleElements(
                    'patients',
                    this.apiService.ownClientId
                )
            )
        );

        this.registerFeatureElementManager(
            new VehicleFeatureManager(
                this.store,
                this.olMap,
                vehicleLayer,
                this.apiService
            ),
            this.store.select(
                getSelectVisibleElements(
                    'vehicles',
                    this.apiService.ownClientId
                )
            )
        );

        this.registerFeatureElementManager(
            new PersonnelFeatureManager(
                this.store,
                this.olMap,
                personnelLayer,
                this.apiService
            ),
            this.store.select(
                getSelectVisibleElements(
                    'personnel',
                    this.apiService.ownClientId
                )
            )
        );

        this.registerFeatureElementManager(
            new MaterialFeatureManager(
                this.store,
                this.olMap,
                materialLayer,
                this.apiService
            ),
            this.store.select(
                getSelectVisibleElements(
                    'materials',
                    this.apiService.ownClientId
                )
            )
        );

        this.registerFeatureElementManager(
            new MapImageFeatureManager(
                this.store,
                this.olMap,
                mapImagesLayer,
                this.apiService
            ),
            this.store.select(selectMapImages)
        );

        this.registerFeatureElementManager(
            new CateringLinesFeatureManager(cateringLinesLayer),
            this.store.select(selectCateringLines)
        );

        this.registerFeatureElementManager(
            new ViewportFeatureManager(
                this.store,
                this.olMap,
                viewportLayer,
                this.apiService
            ),
            this.store.select(selectViewports)
        );

        this.registerPopupTriggers(translateInteraction);
        this.registerDropHandler(translateInteraction);
        this.registerDropHandler(viewportTranslate);
        this.registerViewportRestriction();

        // Register handlers that disable or enable certain interactions
        combineLatest([
            this.store.select(selectExerciseStatus),
            this.apiService.currentRole$,
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([status, currentRole]) => {
                const showPausedOverlay =
                    status !== 'running' && currentRole === 'participant';
                customInteractions.forEach((interaction) => {
                    interaction.setActive(
                        !showPausedOverlay && currentRole !== 'timeTravel'
                    );
                });
                this.setPopupsEnabled(!showPausedOverlay);
                this.getOlViewportElement().style.filter = showPausedOverlay
                    ? 'brightness(50%)'
                    : '';
            });
    }

    private popupsEnabled = true;
    private setPopupsEnabled(enabled: boolean) {
        this.popupsEnabled = enabled;
        if (!enabled) {
            // Close all open popups
            this.changePopup$.next(undefined);
        }
    }

    private registerViewportRestriction() {
        this.tryToFitViewToViewports(false);
        this.store
            .select(getSelectRestrictedViewport(this.apiService.ownClientId))
            .pipe(takeUntil(this.destroy$))
            .subscribe((viewport) => {
                const view = this.olMap.getView();
                view.set('extent', undefined);
                view.setMinZoom(0);
                if (!viewport) {
                    // We are no longer restricted to a viewport.
                    // Therefore, no new restrictions have to be set.
                    return;
                }
                const center = view.getCenter()!;
                const previousZoom = view.getZoom()!;
                const targetExtent = [
                    viewport.position.x,
                    viewport.position.y - viewport.size.height,
                    viewport.position.x + viewport.size.width,
                    viewport.position.y,
                ];
                view.fit(targetExtent);
                const matchingZoom = view.getZoom()!;
                if (isInViewport(center, viewport)) {
                    // We only want to change the zoom if necessary
                    view.setZoom(previousZoom);
                    view.setCenter(center);
                }

                view.set('extent', targetExtent);
                const minZoom = Math.min(matchingZoom, view.getMaxZoom());
                view.setMinZoom(minZoom);
            });
    }

    private registerFeatureElementManager<
        Element extends ImmutableJsonObject,
        T extends MergeIntersection<
            ElementManager<Element, any, any, any> & FeatureManager<any>
        >
    >(
        featureManager: T,
        elementDictionary$: Observable<{ [id: UUID]: Element }>
    ) {
        this.layerFeatureManagerDictionary.set(
            featureManager.layer,
            featureManager
        );
        featureManager.togglePopup$?.subscribe(this.changePopup$);
        // Propagate the changes on an element to the featureManager
        elementDictionary$
            .pipe(startWith({}), pairwise(), takeUntil(this.destroy$))
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
    }

    private registerPopupTriggers(translateInteraction: Translate) {
        this.olMap.on('singleclick', (event) => {
            if (!this.popupsEnabled) {
                return;
            }
            this.olMap.forEachFeatureAtPixel(
                event.pixel,
                (feature, layer) => {
                    // Skip layer when unset
                    if (layer === null) {
                        return false;
                    }
                    this.layerFeatureManagerDictionary
                        .get(
                            layer as VectorLayer<
                                VectorSource<LineString | Point>
                            >
                        )!
                        .onFeatureClicked(
                            event,
                            feature as Feature<LineString | Point>
                        );
                    // we only want the top one -> a truthy return breaks this loop
                    return true;
                },
                { hitTolerance: 10 }
            );
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
                // Skip layer when unset
                {
                    if (layer === null) {
                        return;
                    }
                    // we stop propagating the event as soon as the onFeatureDropped function returns true
                    this.layerFeatureManagerDictionary
                        .get(
                            layer as VectorLayer<
                                VectorSource<LineString | Point>
                            >
                        )!
                        .onFeatureDrop(
                            event,
                            event.features.getArray()[0] as Feature<
                                LineString | Point
                            >,
                            feature as Feature<Point>
                        );
                }
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

    private getOlViewportElement(): HTMLElement {
        return this.olMap
            .getTargetElement()
            .querySelectorAll('.ol-viewport')[0] as HTMLElement;
    }

    /**
     * Sets the map's view to see all viewports.
     */
    public tryToFitViewToViewports(animate = true) {
        const currentState = getStateSnapshot(this.store);
        if (
            getSelectRestrictedViewport(this.apiService.ownClientId)(
                currentState
            ) !== undefined
        ) {
            // We are restricted to a viewport -> you can't fit the view
            return;
        }
        const viewports = Object.values(selectViewports(currentState));
        const view = this.olMap.getView();
        if (viewports.length === 0) {
            view.setCenter([startingPosition.x, startingPosition.y]);
            return;
        }
        const minX = Math.min(
            ...viewports.map((viewport) => viewport.position.x)
        );
        const minY = Math.min(
            ...viewports.map(
                (viewport) => viewport.position.y - viewport.size.height
            )
        );
        const maxX = Math.max(
            ...viewports.map(
                (viewport) => viewport.position.x + viewport.size.width
            )
        );
        const maxY = Math.max(
            ...viewports.map((viewport) => viewport.position.y)
        );
        const padding = 25;
        view.fit([minX, minY, maxX, maxY], {
            padding: [padding, padding, padding, padding],
            duration: animate ? 1000 : undefined,
        });
    }

    public changeZoom(mode: 'zoomIn' | 'zoomOut') {
        const delta = mode === 'zoomIn' ? 1 : -1;
        const view = this.olMap.getView();
        view.animate({
            zoom: (view.getZoom() ?? OlMapManager.defaultZoom) + delta,
            duration: 200,
        });
    }

    public destroy() {
        this.destroy$.next();
        this.olMap?.dispose();
        this.olMap?.setTarget(undefined);
    }
}
