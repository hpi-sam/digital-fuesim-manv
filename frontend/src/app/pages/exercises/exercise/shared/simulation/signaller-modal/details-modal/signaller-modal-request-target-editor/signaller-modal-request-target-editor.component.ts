import type { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ExerciseRequestTargetConfiguration,
    RequestBehaviorState,
} from 'digital-fuesim-manv-shared';
import {
    SimulatedRegionRequestTargetConfiguration,
    TraineesRequestTargetConfiguration,
    UUID,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import type { SearchableDropdownOption } from 'src/app/shared/components/searchable-dropdown/searchable-dropdown.component';
import { map, tap, type Observable, combineLatest } from 'rxjs';
import {
    createSelectBehaviorState,
    selectSimulatedRegions,
} from 'src/app/state/application/selectors/exercise.selectors';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-request-target-editor',
    templateUrl: './signaller-modal-request-target-editor.component.html',
    styleUrls: ['./signaller-modal-request-target-editor.component.scss'],
})
export class SignallerModalRequestDestinationEditorComponent
    implements OnInit, OnChanges, OnDestroy
{
    public readonly TRAINEES_ID = 'trainees' as const;
    public readonly TRAINEES_NAME = 'Die übende Einsatzleitung' as const;

    @Input() simulatedRegionId!: UUID;
    @Input() requestBehaviorId!: UUID;

    private hotkeyLayer!: HotkeyLayer;
    submitHotkey = new Hotkey('Enter', false, () => this.updateTarget());

    availableTargets$!: Observable<SearchableDropdownOption[]>;
    currentTargetName$!: Observable<string>;
    selectedTarget: SearchableDropdownOption | null = null;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService,
        private readonly hotkeysService: HotkeysService
    ) {}

    ngOnInit() {
        this.hotkeyLayer = this.hotkeysService.createLayer();
        this.hotkeyLayer.addHotkey(this.submitHotkey);
    }

    ngOnChanges() {
        const simulatedRegions$ = this.store.select(selectSimulatedRegions);

        const currentTarget$ = this.store
            .select(
                createSelectBehaviorState(
                    this.simulatedRegionId,
                    this.requestBehaviorId
                )
            )
            .pipe(
                map(
                    (behavior) =>
                        (behavior as RequestBehaviorState).requestTarget
                )
            );

        this.currentTargetName$ = combineLatest([
            currentTarget$,
            simulatedRegions$,
        ]).pipe(
            map(([target, simulatedRegions]) =>
                target.type === 'traineesRequestTarget'
                    ? this.TRAINEES_NAME
                    : simulatedRegions[target.targetSimulatedRegionId]?.name ??
                      'unbekannt'
            )
        );

        this.availableTargets$ = simulatedRegions$.pipe(
            map((simulatedRegions) =>
                Object.values(simulatedRegions).filter(
                    (simulatedRegion) =>
                        simulatedRegion.id !== this.simulatedRegionId
                )
            ),
            map((simulatedRegions) =>
                simulatedRegions.map((simulatedRegion) => ({
                    identifier: simulatedRegion.id,
                    name: `[Simuliert] ${simulatedRegion.name}`,
                }))
            ),
            map((options) =>
                options.sort((a, b) => a.name.localeCompare(b.name))
            ),
            map((options) => [
                {
                    identifier: this.TRAINEES_ID,
                    name: this.TRAINEES_NAME,
                },
                ...options,
            ]),
            tap((options) => {
                if (
                    !options.some(
                        (option) =>
                            option.identifier ===
                            this.selectedTarget?.identifier
                    )
                ) {
                    this.selectedTarget = null;
                }
            })
        );
    }

    ngOnDestroy() {
        this.hotkeysService.removeLayer(this.hotkeyLayer);
    }

    selectTarget(selectedTarget: SearchableDropdownOption) {
        this.selectedTarget = selectedTarget;
    }

    updateTarget() {
        if (!this.selectedTarget) return;

        let requestTarget: ExerciseRequestTargetConfiguration;

        if (this.selectedTarget.identifier === this.TRAINEES_ID) {
            requestTarget = TraineesRequestTargetConfiguration.create();
        } else {
            requestTarget = SimulatedRegionRequestTargetConfiguration.create(
                this.selectedTarget.identifier
            );
        }

        this.exerciseService.proposeAction({
            type: '[RequestBehavior] Update RequestTarget',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.requestBehaviorId,
            requestTarget,
        });

        this.close();
    }

    close() {
        this.detailsModal.close();
    }
}
