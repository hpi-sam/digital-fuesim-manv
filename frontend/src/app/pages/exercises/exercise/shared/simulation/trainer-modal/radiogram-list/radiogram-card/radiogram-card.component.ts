import type {
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    ExerciseRadiogram,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import type { UUID } from 'digital-fuesim-manv-shared';
import {
    Client,
    currentParticipantIdOf,
    isAccepted,
    isDone,
    isUnread,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { selectOwnClientId } from 'src/app/state/application/selectors/application.selectors';
import {
    createSelectRadiogram,
    selectClients,
    selectSimulatedRegions,
} from 'src/app/state/application/selectors/exercise.selectors';
import { ExerciseService } from 'src/app/core/exercise.service';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { HotkeyLayer } from 'src/app/shared/services/hotkeys.service';
import {
    Hotkey,
    HotkeysService,
} from 'src/app/shared/services/hotkeys.service';
import { SelectSignallerRegionService } from '../../../signaller-modal/select-signaller-region.service';

// Clients that leave are lost from the state but radiograms might point to them.
// This is a fallback to show something useful in the UI
const unavailableClient = Client.create('Unbekannt', 'participant');

@Component({
    selector: 'app-radiogram-card',
    templateUrl: './radiogram-card.component.html',
    styleUrls: ['./radiogram-card.component.scss'],
    standalone: false,
})
export class RadiogramCardComponent implements OnInit, OnChanges, OnDestroy {
    @Input() radiogramId!: UUID;
    @Input() shownInSignallerModal = false;
    @Input() first!: boolean;

    radiogram$!: Observable<ExerciseRadiogram>;
    simulatedRegion$!: Observable<SimulatedRegion | undefined>;

    ownClientId!: UUID;

    status$!: Observable<
        'done' | 'otherAccepted' | 'ownAccepted' | 'unread' | undefined
    >;
    acceptingClient$!: Observable<Client | undefined>;

    private hotkeyLayer: HotkeyLayer | null = null;
    readonly acceptHotkey = new Hotkey('F1', false, () => {
        this.acceptOrMarkAsDone();
    });
    readonly returnHotkey = new Hotkey('⇧ + F1', false, () => {
        if (
            isAccepted(
                selectStateSnapshot(
                    createSelectRadiogram(this.radiogramId),
                    this.store
                )
            )
        ) {
            this.return();
        }
    });

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService,
        private readonly hotkeyService: HotkeysService,
        private readonly selectRegionService: SelectSignallerRegionService
    ) {}

    ngOnInit(): void {
        this.ownClientId = selectStateSnapshot(selectOwnClientId, this.store)!;

        const selectRadiogram = createSelectRadiogram(this.radiogramId);
        this.radiogram$ = this.store.select(selectRadiogram);

        this.simulatedRegion$ = this.store.select(
            createSelector(
                selectRadiogram,
                selectSimulatedRegions,
                (radiogram, simulatedRegions) =>
                    simulatedRegions[radiogram.simulatedRegionId]
            )
        );

        this.status$ = this.radiogram$.pipe(
            map((radiogram) => {
                if (isUnread(radiogram)) return 'unread';
                if (isAccepted(radiogram)) {
                    return currentParticipantIdOf(radiogram) ===
                        this.ownClientId
                        ? 'ownAccepted'
                        : 'otherAccepted';
                }
                if (isDone(radiogram)) return 'done';
                return undefined;
            })
        );

        const selectClient = createSelector(
            selectRadiogram,
            selectClients,
            (radiogram, clients) => {
                if (!isAccepted(radiogram)) {
                    return undefined;
                }
                const clientId = currentParticipantIdOf(radiogram);
                return clients[clientId] ?? unavailableClient;
            }
        );

        this.acceptingClient$ = this.store.select(selectClient);

        this.initializeHotkeyLayer();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initializeHotkeyLayer();

        if ('first' in changes) {
            if (this.first && this.shownInSignallerModal) {
                this.hotkeyLayer!.addHotkey(this.acceptHotkey);
                this.hotkeyLayer!.addHotkey(this.returnHotkey);
            } else {
                this.hotkeyLayer!.removeHotkey(this.acceptHotkey);
                this.hotkeyLayer!.removeHotkey(this.returnHotkey);
            }
        }
    }

    ngOnDestroy() {
        if (this.hotkeyLayer) {
            this.hotkeyService.removeLayer(this.hotkeyLayer);
        }
    }

    initializeHotkeyLayer() {
        this.hotkeyLayer ??= this.hotkeyService.createLayer();
    }

    acceptOrMarkAsDone() {
        if (
            isAccepted(
                selectStateSnapshot(
                    createSelectRadiogram(this.radiogramId),
                    this.store
                )
            )
        ) {
            this.markAsDone();
        } else {
            this.accept();
        }
    }

    accept() {
        this.exerciseService
            .proposeAction({
                type: '[Radiogram] Accept radiogram',
                clientId: this.ownClientId,
                radiogramId: this.radiogramId,
            })
            .then((result) => {
                if (result.success && this.shownInSignallerModal) {
                    this.selectRegionService.selectSimulatedRegion(
                        selectStateSnapshot(
                            createSelectRadiogram(this.radiogramId),
                            this.store
                        ).simulatedRegionId
                    );
                }
            });
    }

    return() {
        this.exerciseService.proposeAction({
            type: '[Radiogram] Return radiogram',
            radiogramId: this.radiogramId,
        });
    }

    markAsDone() {
        this.exerciseService.proposeAction({
            type: '[Radiogram] Mark as done',
            clientId: this.ownClientId,
            radiogramId: this.radiogramId,
        });
    }
}
