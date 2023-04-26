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
import type { ExerciseStatus, Role, UUID } from 'digital-fuesim-manv-shared';
import type { TranslateEvent } from 'ol/interaction/Translate';
import type { Pixel } from 'ol/pixel';
import { featureElementKey } from '../feature-managers/element-manager';
import { TranslateInteraction } from './translate-interaction';
import type { PopupManager } from './popup-manager';
import type { FeatureManager } from './feature-manager';

export class OlMapInteractionsManager {
    private readonly featureLayers: VectorLayer<VectorSource>[] = [];
    private readonly trainerInteractions: Interaction[] = [];
    private translateInteraction: TranslateInteraction =
        new TranslateInteraction();
    private participantInteractions: Interaction[] = [];
    private interactions: Collection<Interaction> =
        new Collection<Interaction>();
    private lastStatus: ExerciseStatus | undefined;
    private lastRole: Role | 'timeTravel' | undefined;

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
        this.updateInteractions();
        this.registerInteractionEnablementHandler();
    }

    public addFeatureLayer(layer: VectorLayer<VectorSource>) {
        this.featureLayers.push(layer);
        this.syncInteractionsAndHandler();
    }

    public addTrainerInteraction(interaction: Interaction) {
        this.trainerInteractions.push(interaction);
        this.syncInteractionsAndHandler();
    }

    private syncInteractionsAndHandler() {
        this.updateInteractions();
        this.registerDropHandler();
        this.applyInteractions();
        this.updateInteractionEnablement(this.lastStatus, this.lastRole);
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

    private updateParticipantInteractions() {
        this.participantInteractions = [this.translateInteraction];
    }

    private updateInteractions() {
        this.updateTranslateInteraction();
        this.updateParticipantInteractions();
        this.interactions = defaultInteractions({
            pinchRotate: false,
            altShiftDragRotate: false,
            keyboard: true,
        }).extend(
            selectStateSnapshot(selectCurrentRole, this.store) === 'trainer'
                ? [...this.participantInteractions, ...this.trainerInteractions]
                : [...this.participantInteractions]
        );
    }

    private applyInteractions() {
        this.mapInteractions.clear();
        // We just want to modify this for the Map not do anything with it after so we ignore the returned value
        // eslint-disable-next-line rxjs/no-ignored-observable
        this.mapInteractions.extend(this.interactions.getArray());
    }

    // Register handlers that disable or enable certain interactions
    private registerInteractionEnablementHandler() {
        combineLatest([
            this.store.select(selectExerciseStatus),
            this.store.select(selectCurrentRole),
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([status, currentRole]) => {
                this.updateInteractionEnablement(status, currentRole);
            });
    }

    // this shows a paused overlay and disables interactions for participants when the exercise is paused
    private updateInteractionEnablement(
        status: ExerciseStatus | undefined,
        currentRole: Role | 'timeTravel' | undefined
    ) {
        this.lastRole = currentRole;
        this.lastStatus = status;
        const isPausedAndParticipant =
            status !== 'running' && currentRole === 'participant';
        const areInteractionsActive =
            !isPausedAndParticipant && currentRole !== 'timeTravel';
        this.participantInteractions.forEach((interaction) => {
            interaction.setActive(areInteractionsActive);
        });
        this.popupManager.setPopupsEnabled(!isPausedAndParticipant);
        this.getOlViewportElement().style.filter = isPausedAndParticipant
            ? 'brightness(50%)'
            : '';
    }

    private registerDropHandler() {
        this.translateInteraction.on('translateend', (event) => {
            const pixel = this.olMap.getPixelFromCoordinate(event.coordinate);
            const droppedFeature: Feature = event.features.getArray()[0]!;
            this.handleTranslateEnd(pixel, droppedFeature, event);
        });
    }

    private handleTranslateEnd(
        pixel: Pixel,
        droppedFeature: Feature,
        event: TranslateEvent
    ) {
        if (
            droppedFeature.getId() !== undefined &&
            this.popupManager.currentClosingIds.includes(
                droppedFeature.getId() as UUID
            )
        ) {
            this.popupManager.togglePopup(undefined);
        }

        this.olMap.forEachFeatureAtPixel(pixel, (droppedOnFeature, layer) => {
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
                    this.getElementFromFeature(droppedFeature),
                    droppedOnFeature as Feature,
                    event
                );
        });
    }

    private getOlViewportElement(): HTMLElement {
        return this.olMap
            .getTargetElement()
            .querySelectorAll('.ol-viewport')[0] as HTMLElement;
    }

    private getElementFromFeature(feature: Feature<any>) {
        return feature.get(featureElementKey);
    }
}
