import type { NgZone } from '@angular/core';
import type { Store } from '@ngrx/store';
import type {
    ImmutableJsonObject,
    MergeIntersection,
    UUID,
} from 'digital-fuesim-manv-shared';
import { currentCoordinatesOf } from 'digital-fuesim-manv-shared';
import type { Feature } from 'ol';
import { Overlay, View } from 'ol';
import { defaults as defaultInteractions } from 'ol/interaction';
import TileLayer from 'ol/layer/Tile';
import type VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import type VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import type { Observable } from 'rxjs';
import { combineLatest, pairwise, startWith, Subject, takeUntil } from 'rxjs';
import type { ExerciseService } from 'src/app/core/exercise.service';
import { handleChanges } from 'src/app/shared/functions/handle-changes';
import type { AppState } from 'src/app/state/app.state';
import {
    selectExerciseStatus,
    selectTileMapProperties,
    selectTransferLines,
    selectViewports,
} from 'src/app/state/application/selectors/exercise.selectors';
import {
    selectCurrentRole,
    selectRestrictedViewport,
    selectVisibleCateringLines,
    selectVisibleMapImages,
    selectVisibleMaterials,
    selectVisiblePatients,
    selectVisiblePersonnel,
    selectVisibleSimulatedRegions,
    selectVisibleTransferPoints,
    selectVisibleVehicles,
    selectVisibleViewports,
} from 'src/app/state/application/selectors/shared.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { TransferLinesService } from '../../core/transfer-lines.service';
import { startingPosition } from '../../starting-position';
import { CateringLinesFeatureManager } from '../feature-managers/catering-lines-feature-manager';
import { DeleteFeatureManager } from '../feature-managers/delete-feature-manager';
import type { ElementManager } from '../feature-managers/element-manager';
import { MapImageFeatureManager } from '../feature-managers/map-images-feature-manager';
import { MaterialFeatureManager } from '../feature-managers/material-feature-manager';
import { PatientFeatureManager } from '../feature-managers/patient-feature-manager';
import { PersonnelFeatureManager } from '../feature-managers/personnel-feature-manager';
import { SimulatedRegionFeatureManager } from '../feature-managers/simulated-region-feature-manager';
import { TransferLinesFeatureManager } from '../feature-managers/transfer-lines-feature-manager';
import { TransferPointFeatureManager } from '../feature-managers/transfer-point-feature-manager';
import { VehicleFeatureManager } from '../feature-managers/vehicle-feature-manager';
import {
    isInViewport,
    ViewportFeatureManager,
} from '../feature-managers/viewport-feature-manager';
import type { FeatureManager } from './feature-manager';
import type { OpenPopupOptions } from './popup-manager';
import { ResizeRectangleInteraction } from './resize-rectangle-interaction';
import { TranslateInteraction } from './translate-interaction';

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
        private readonly exerciseService: ExerciseService,
        private readonly openLayersContainer: HTMLDivElement,
        private readonly popoverContainer: HTMLDivElement,
        private readonly ngZone: NgZone,
        transferLinesService: TransferLinesService
    ) {
        // Layers
        const satelliteLayer = new TileLayer({
            preload: Number.POSITIVE_INFINITY,
        });
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
        this.popupOverlay = new Overlay({
            element: this.popoverContainer,
        });

        this.olMap = new OlMap({
            interactions: [],
            // We use Angular buttons instead
            controls: [],
            target: this.openLayersContainer,
            // Note: The order of this array determines the order of the objects on the map.
            // The most bottom objects must be at the top of the array.
            layers: [],
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

        // FeatureManagers

        const transferLinesFeatureManager = new TransferLinesFeatureManager();
        const transferPointFeatureManager = new TransferPointFeatureManager(
            this.olMap,
            this.store,
            this.exerciseService
        );
        const patientFeatureManager = new PatientFeatureManager(
            this.store,
            this.olMap,
            this.exerciseService
        );
        const vehicleFeatureManager = new VehicleFeatureManager(
            this.olMap,
            this.exerciseService
        );
        const personnelFeatureManager = new PersonnelFeatureManager(
            this.olMap,
            this.exerciseService
        );
        const materialFeatureManager = new MaterialFeatureManager(
            this.olMap,
            this.exerciseService
        );
        const mapImageFeatureManager = new MapImageFeatureManager(
            this.olMap,
            this.exerciseService,
            this.store
        );
        const cateringLinesFeatureManager = new CateringLinesFeatureManager();

        const viewportFeatureManager = new ViewportFeatureManager(
            this.olMap,
            this.exerciseService,
            this.store
        );
        const simulatedRegionFeatureManager = new SimulatedRegionFeatureManager(
            this.olMap,
            this.exerciseService,
            this.store
        );

        const deleteFeatureManager = new DeleteFeatureManager(
            this.store,
            this.olMap,
            this.exerciseService
        );
        if (selectStateSnapshot(selectCurrentRole, this.store) === 'trainer') {
            deleteFeatureManager.makeVisible();
            this.registerFeatureElementManager(
                transferLinesFeatureManager,
                this.store.select(selectTransferLines)
            );
            transferLinesService.displayTransferLines$.subscribe((display) => {
                transferLinesFeatureManager.layer.setVisible(display);
            });
            this.layerFeatureManagerDictionary.set(
                deleteFeatureManager.layer,
                deleteFeatureManager
            );
        }

        this.registerFeatureElementManager(
            transferPointFeatureManager,
            this.store.select(selectVisibleTransferPoints)
        );

        this.registerFeatureElementManager(
            patientFeatureManager,
            this.store.select(selectVisiblePatients)
        );

        this.registerFeatureElementManager(
            vehicleFeatureManager,
            this.store.select(selectVisibleVehicles)
        );

        this.registerFeatureElementManager(
            personnelFeatureManager,
            this.store.select(selectVisiblePersonnel)
        );

        this.registerFeatureElementManager(
            materialFeatureManager,
            this.store.select(selectVisibleMaterials)
        );

        this.registerFeatureElementManager(
            mapImageFeatureManager,
            this.store.select(selectVisibleMapImages)
        );

        this.registerFeatureElementManager(
            cateringLinesFeatureManager,
            this.store.select(selectVisibleCateringLines)
        );

        this.registerFeatureElementManager(
            viewportFeatureManager,
            this.store.select(selectVisibleViewports)
        );

        this.registerFeatureElementManager(
            simulatedRegionFeatureManager,
            this.store.select(selectVisibleSimulatedRegions)
        );

        // Register the Layers in the correct Order
        // The order represents the order of the layers on the map (last element is on top)

        this.olMap.getLayers().clear();
        this.olMap.addLayer(satelliteLayer);

        const featureLayers = [
            deleteFeatureManager.layer,
            simulatedRegionFeatureManager.layer,
            mapImageFeatureManager.layer,
            transferLinesFeatureManager.layer,
            transferPointFeatureManager.layer,
            vehicleFeatureManager.layer,
            cateringLinesFeatureManager.layer,
            patientFeatureManager.layer,
            personnelFeatureManager.layer,
            materialFeatureManager.layer,
            viewportFeatureManager.layer,
        ];

        // We just want to modify this for the Map not do anything with it after so we ignore the returned value
        // eslint-disable-next-line rxjs/no-ignored-observable
        this.olMap.getLayers().extend(featureLayers);

        // Create Interactions

        const translateInteraction = new TranslateInteraction({
            layers: featureLayers,
            hitTolerance: 10,
            filter: (feature, layer) => {
                const featureManager = this.layerFeatureManagerDictionary.get(
                    layer as VectorLayer<VectorSource>
                );
                return featureManager === undefined
                    ? false
                    : featureManager.isFeatureTranslatable(feature);
            },
        });

        const resizeViewportInteraction = new ResizeRectangleInteraction(
            viewportFeatureManager.layer.getSource()!
        );
        const resizeSimulatedRegionInteraction = new ResizeRectangleInteraction(
            simulatedRegionFeatureManager.layer.getSource()!
        );
        const alwaysInteractions = [translateInteraction];
        const customInteractions =
            selectStateSnapshot(selectCurrentRole, this.store) === 'trainer'
                ? [
                      ...alwaysInteractions,
                      resizeViewportInteraction,
                      resizeSimulatedRegionInteraction,
                  ]
                : alwaysInteractions;
        const interactions = defaultInteractions({
            pinchRotate: false,
            altShiftDragRotate: false,
            keyboard: true,
        }).extend(customInteractions);

        const mapInteractions = this.olMap.getInteractions();
        mapInteractions.clear();
        // We just want to modify this for the Map not do anything with it after so we ignore the returned value
        // eslint-disable-next-line rxjs/no-ignored-observable
        mapInteractions.extend(interactions.getArray());

        this.registerPopupTriggers();
        this.registerDropHandler(translateInteraction);
        this.registerViewportRestriction();

        // Register handlers that disable or enable certain interactions
        combineLatest([
            this.store.select(selectExerciseStatus),
            this.store.select(selectCurrentRole),
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
            .select(selectRestrictedViewport)
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
                    currentCoordinatesOf(viewport).x,
                    currentCoordinatesOf(viewport).y - viewport.size.height,
                    currentCoordinatesOf(viewport).x + viewport.size.width,
                    currentCoordinatesOf(viewport).y,
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
            ElementManager<Element, any> & FeatureManager<any>
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
                    handleChanges(oldElementDictionary, newElementDictionary, {
                        createHandler: (element) =>
                            featureManager.onElementCreated(element),
                        deleteHandler: (element) =>
                            featureManager.onElementDeleted(element),
                        changeHandler: (oldElement, newElement) =>
                            featureManager.onElementChanged(
                                oldElement,
                                newElement
                            ),
                    });
                });
            });
    }

    private registerPopupTriggers() {
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
                        .get(layer as VectorLayer<VectorSource>)!
                        .onFeatureClicked(event, feature as Feature);
                    // we only want the top one -> a truthy return breaks this loop
                    return true;
                },
                { hitTolerance: 10 }
            );
            if (!this.olMap!.hasFeatureAtPixel(event.pixel)) {
                this.changePopup$.next(undefined);
            }
        });

        this.openLayersContainer.addEventListener('keydown', (event) => {
            if ((event as KeyboardEvent).key === 'Escape') {
                this.changePopup$.next(undefined);
            }
        });
    }

    private registerDropHandler(translateInteraction: TranslateInteraction) {
        translateInteraction.on('translateend', (event) => {
            const pixel = this.olMap.getPixelFromCoordinate(event.coordinate);
            const droppedFeature: Feature = event.features.getArray()[0]!;

            this.olMap.forEachFeatureAtPixel(
                pixel,
                (droppedOnFeature, layer) => {
                    // Skip layer when unset
                    if (layer === null) {
                        return;
                    }

                    // Do not drop a feature on itself
                    if (droppedFeature === droppedOnFeature) {
                        return;
                    }

                    // We stop propagating the event as soon as the onFeatureDropped function returns true
                    return this.layerFeatureManagerDictionary
                        .get(layer as VectorLayer<VectorSource>)!
                        .onFeatureDrop(
                            event,
                            droppedFeature,
                            droppedOnFeature as Feature
                        );
                }
            );
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
        if (
            selectStateSnapshot(selectRestrictedViewport, this.store) !==
            undefined
        ) {
            // We are restricted to a viewport -> you can't fit the view
            return;
        }
        const viewports = Object.values(
            selectStateSnapshot(selectViewports, this.store)
        );
        const view = this.olMap.getView();
        if (viewports.length === 0) {
            view.setCenter([startingPosition.x, startingPosition.y]);
            return;
        }
        const minX = Math.min(
            ...viewports.map((viewport) => currentCoordinatesOf(viewport).x)
        );
        const minY = Math.min(
            ...viewports.map(
                (viewport) =>
                    currentCoordinatesOf(viewport).y - viewport.size.height
            )
        );
        const maxX = Math.max(
            ...viewports.map(
                (viewport) =>
                    currentCoordinatesOf(viewport).x + viewport.size.width
            )
        );
        const maxY = Math.max(
            ...viewports.map((viewport) => currentCoordinatesOf(viewport).y)
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
        this.olMap.dispose();
        this.olMap.setTarget(undefined);
    }
}
