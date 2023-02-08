import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import type { Interaction } from 'ol/interaction';
import { defaults as defaultInteractions } from 'ol/interaction';
import { combineLatest, takeUntil } from 'rxjs';
import { selectExerciseStatus } from 'src/app/state/application/selectors/exercise.selectors';
import type { Collection } from 'ol';
import type { AppState } from 'src/app/state/app.state';
import type { Store } from '@ngrx/store';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { TranslateInteraction } from '../translate-interaction';
import { ResizeRectangleInteraction } from '../resize-rectangle-interaction';
import type { ViewportFeatureManager } from '../../feature-managers/viewport-feature-manager';
import type { SimulatedRegionFeatureManager } from '../../feature-managers/simulated-region-feature-manager';
import type { OlMapManager } from './ol-map-manager';

export class OlMapInteractionsManager {
    constructor(
        private readonly mapInteractions: Collection<Interaction>,
        private readonly featureLayers: any,
        private readonly store: Store<AppState>,
        private readonly mapManager: OlMapManager,
        private readonly viewportFeatureManager: ViewportFeatureManager,
        private readonly simulatedRegionFeatureManager: SimulatedRegionFeatureManager
    ) {}

    // Create Interactions

    translateInteraction = new TranslateInteraction({
        layers: this.featureLayers,
        hitTolerance: 10,
        filter: (feature, layer) => {
            const featureManager =
                this.mapManager.layerFeatureManagerDictionary.get(
                    layer as VectorLayer<VectorSource>
                );
            return featureManager === undefined
                ? false
                : featureManager.isFeatureTranslatable(feature);
        },
    });

    resizeViewportInteraction = new ResizeRectangleInteraction(
        this.viewportFeatureManager.layer.getSource()!
    );

    resizeSimulatedRegionInteraction = new ResizeRectangleInteraction(
        this.simulatedRegionFeatureManager.layer.getSource()!
    );

    alwaysInteractions = [this.translateInteraction];

    customInteractions =
        selectStateSnapshot(selectCurrentRole, this.store) === 'trainer'
            ? [
                  ...this.alwaysInteractions,
                  this.resizeViewportInteraction,
                  this.resizeSimulatedRegionInteraction,
              ]
            : this.alwaysInteractions;

    interactions = defaultInteractions({
        pinchRotate: false,
        altShiftDragRotate: false,
        keyboard: true,
    }).extend(this.customInteractions);

    public applyInteractions() {
        this.mapInteractions.clear();
        // We just want to modify this for the Map not do anything with it after so we ignore the returned value
        // eslint-disable-next-line rxjs/no-ignored-observable
        this.mapInteractions.extend(this.interactions.getArray());
    }
    // Register handlers that disable or enable certain interactions
    registerHandlers() {
        combineLatest([
            this.store.select(selectExerciseStatus),
            this.store.select(selectCurrentRole),
        ])
            .pipe(takeUntil(this.mapManager.destroy$))
            .subscribe(([status, currentRole]) => {
                const showPausedOverlay =
                    status !== 'running' && currentRole === 'participant';
                this.customInteractions.forEach((interaction) => {
                    interaction.setActive(
                        !showPausedOverlay && currentRole !== 'timeTravel'
                    );
                });
                this.mapManager.setPopupsEnabled(!showPausedOverlay);
                this.mapManager.getOlViewportElement().style.filter =
                    showPausedOverlay ? 'brightness(50%)' : '';
            });
        this.mapManager.registerDropHandler(this.translateInteraction);
    }
}
