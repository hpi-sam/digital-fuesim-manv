import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import type { Interaction } from 'ol/interaction';
import { defaults as defaultInteractions } from 'ol/interaction';
import type { Subject } from 'rxjs';
import { combineLatest, takeUntil } from 'rxjs';
import { selectExerciseStatus } from 'src/app/state/application/selectors/exercise.selectors';
import type { Feature } from 'ol';
import { Collection } from 'ol';
import type OlMap from 'ol/Map';
import type { AppState } from 'src/app/state/app.state';
import type { Store } from '@ngrx/store';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { OlMapManager } from './ol-map-manager';
import { TranslateInteraction } from './translate-interaction';
import type { PopupManager } from './popup-manager';
import type { FeatureManager } from './feature-manager';

export class OlMapInteractionsManager {
    private readonly featureLayers: VectorLayer<VectorSource>[];
    private readonly customInteractions: Interaction[];
    private translateInteraction: TranslateInteraction;
    private alwaysInteractions: Interaction[];
    interactions: Collection<Interaction>;

    constructor(
        private readonly mapInteractions: Collection<Interaction>,
        private readonly store: Store<AppState>,
        private readonly popupManager: PopupManager,
        private readonly olMap: OlMap,
        private readonly layerFeatureManagerDictionary: Map<
            VectorLayer<VectorSource>,
            FeatureManager<any>
        >,
        private readonly destroy$: Subject<void>
    ) {
        this.featureLayers = [];
        this.customInteractions = [];
        this.interactions = new Collection<Interaction>();
        this.translateInteraction = new TranslateInteraction();
        this.alwaysInteractions = [this.translateInteraction];
        this.updateInteractions();
        this.registerCustomInteractionHandlers();
    }

    public addFeatureLayer(layer: VectorLayer<VectorSource>) {
        this.featureLayers.push(layer);
        this.updateRegisterAndApplyAll();
    }

    public addCustomInteraction(interaction: Interaction) {
        this.customInteractions.push(interaction);
        this.updateRegisterAndApplyAll();
    }

    private updateRegisterAndApplyAll() {
        this.updateInteractions();
        this.registerDropHandler();
        this.applyInteractions();
    }

    private updateTranslateInteraction() {
        this.translateInteraction = new TranslateInteraction({
            layers: this.featureLayers,
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
    }

    private updateAlwaysInteractions() {
        this.alwaysInteractions = [this.translateInteraction];
    }

    private updateInteractions() {
        this.updateTranslateInteraction();
        this.updateAlwaysInteractions();
        this.interactions = defaultInteractions({
            pinchRotate: false,
            altShiftDragRotate: false,
            keyboard: true,
        }).extend(
            selectStateSnapshot(selectCurrentRole, this.store) === 'trainer'
                ? [...this.alwaysInteractions, ...this.customInteractions]
                : this.alwaysInteractions
        );
    }

    public applyInteractions() {
        this.mapInteractions.clear();
        // We just want to modify this for the Map not do anything with it after so we ignore the returned value
        // eslint-disable-next-line rxjs/no-ignored-observable
        this.mapInteractions.extend(this.interactions.getArray());
    }

    // Register handlers that disable or enable certain interactions
    registerCustomInteractionHandlers() {
        combineLatest([
            this.store.select(selectExerciseStatus),
            this.store.select(selectCurrentRole),
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([status, currentRole]) => {
                const showPausedOverlay =
                    status !== 'running' && currentRole === 'participant';
                this.customInteractions.forEach((interaction) => {
                    interaction.setActive(
                        !showPausedOverlay && currentRole !== 'timeTravel'
                    );
                });
                this.popupManager.setPopupsEnabled(!showPausedOverlay);
                this.getOlViewportElement().style.filter = showPausedOverlay
                    ? 'brightness(50%)'
                    : '';
            });
    }

    private registerDropHandler() {
        this.translateInteraction.on('translateend', (event) => {
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

    public getOlViewportElement(): HTMLElement {
        return this.olMap
            .getTargetElement()
            .querySelectorAll('.ol-viewport')[0] as HTMLElement;
    }
}
