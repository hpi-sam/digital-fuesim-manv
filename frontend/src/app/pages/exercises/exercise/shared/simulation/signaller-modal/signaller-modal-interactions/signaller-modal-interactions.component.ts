import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ExerciseRadiogram,
    ExerciseSimulationBehaviorType,
} from 'digital-fuesim-manv-shared';
import {
    StrictObject,
    UUID,
    getKeyDetails,
    isAccepted,
    isInterfaceSignallerKeyForClient,
    isUnread,
} from 'digital-fuesim-manv-shared';
import { groupBy } from 'lodash-es';
import type { BehaviorSubject, Observable } from 'rxjs';
import { Subject, map, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import type {
    Hotkey,
    HotkeyLayer,
} from 'src/app/shared/services/hotkeys.service';
import { HotkeysService } from 'src/app/shared/services/hotkeys.service';
import type { AppState } from 'src/app/state/app.state';
import { selectOwnClientId } from 'src/app/state/application/selectors/application.selectors';
import {
    createSelectBehaviorStates,
    selectRadiograms,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';

export type InterfaceSignallerInteraction = Omit<
    SearchableDropdownOption,
    'backgroundColor' | 'color'
> & {
    details?: string;
    hotkey: Hotkey;
    secondaryHotkey?: Hotkey;
    requiredBehaviors: ExerciseSimulationBehaviorType[];
    errorMessage?: string;
    loading$?: BehaviorSubject<boolean>;
};

export function setLoadingState(
    interactions: InterfaceSignallerInteraction[],
    key: string,
    loadingState: boolean
) {
    interactions
        .find((information) => information.key === key)
        ?.loading$?.next(loadingState);
}

@Component({
    selector: 'app-signaller-modal-interactions',
    templateUrl: './signaller-modal-interactions.component.html',
    styleUrls: ['./signaller-modal-interactions.component.scss'],
})
export class SignallerModalInteractionsComponent
    implements OnInit, OnChanges, OnDestroy
{
    @Input()
    simulatedRegionId!: UUID;
    @Input()
    interactions: InterfaceSignallerInteraction[] = [];
    @Input()
    primaryActionLabel = '';
    @Input()
    showSecondaryButton = true;

    private hotkeyLayer: HotkeyLayer | null = null;
    private clientId!: UUID;

    requestable$!: Observable<{ [key: string]: boolean }>;
    requestedRadiograms$!: Observable<{ [key: string]: ExerciseRadiogram[] }>;
    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly hotkeysService: HotkeysService
    ) {}

    ngOnInit() {
        this.clientId = selectStateSnapshot(selectOwnClientId, this.store)!;
    }

    ngOnChanges() {
        if (this.hotkeyLayer) {
            this.hotkeysService.removeLayer(this.hotkeyLayer);
        }
        this.hotkeyLayer = this.hotkeysService.createLayer();

        this.interactions.forEach((informationType) => {
            this.hotkeyLayer!.addHotkey(informationType.hotkey);

            if (informationType.secondaryHotkey) {
                this.hotkeyLayer!.addHotkey(informationType.secondaryHotkey);
            }
        });

        const behaviors$ = this.store.select(
            createSelectBehaviorStates(this.simulatedRegionId)
        );

        this.requestable$ = behaviors$.pipe(
            map((behaviors) =>
                Object.fromEntries(
                    this.interactions.map((interaction) => [
                        interaction.key,
                        interaction.requiredBehaviors.every(
                            (requiredBehavior) =>
                                behaviors.some(
                                    (behavior) =>
                                        behavior.type === requiredBehavior
                                )
                        ),
                    ])
                )
            )
        );

        const radiograms$ = this.store
            .select(selectRadiograms)
            .pipe(map((radiograms) => StrictObject.values(radiograms)));

        // Automatically accept all radiograms that contain reports for requested information
        radiograms$
            .pipe(
                map((radiograms) =>
                    radiograms.filter((radiogram) => isUnread(radiogram))
                ),
                map((radiograms) =>
                    radiograms.filter((radiogram) =>
                        isInterfaceSignallerKeyForClient(
                            radiogram.key,
                            this.clientId
                        )
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe((radiograms) => {
                radiograms.forEach((radiogram) => {
                    this.exerciseService.proposeAction({
                        type: '[Radiogram] Accept radiogram',
                        clientId: this.clientId,
                        radiogramId: radiogram.id,
                    });

                    setLoadingState(
                        this.interactions,
                        getKeyDetails(radiogram.key!),
                        false
                    );
                });
            });

        this.requestedRadiograms$ = radiograms$.pipe(
            map((radiograms) =>
                radiograms.filter((radiogram) => isAccepted(radiogram))
            ),
            map((radiograms) =>
                radiograms.filter((radiogram) =>
                    isInterfaceSignallerKeyForClient(
                        radiogram.key,
                        this.clientId
                    )
                )
            ),
            map((radiograms) =>
                groupBy(radiograms, (radiogram) =>
                    getKeyDetails(radiogram.key!)
                )
            )
        );
    }

    ngOnDestroy() {
        if (this.hotkeyLayer) {
            this.hotkeysService.removeLayer(this.hotkeyLayer);
        }

        this.destroy$.next();
    }
}
