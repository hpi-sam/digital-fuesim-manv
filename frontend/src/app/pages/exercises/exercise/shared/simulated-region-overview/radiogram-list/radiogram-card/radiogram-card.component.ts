import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    ExerciseRadiogram,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import {
    Client,
    currentParticipantIdOf,
    isAccepted,
    isDone,
    isUnread,
    UUID,
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

// Clients that leave are lost from the state but radiograms might point to them.
// This is a fallback to show something useful in the UI
const unavailableClient = Client.create('Unbekannt', 'participant');

@Component({
    selector: 'app-radiogram-card',
    templateUrl: './radiogram-card.component.html',
    styleUrls: ['./radiogram-card.component.scss'],
})
export class RadiogramCardComponent implements OnInit {
    @Input() radiogramId!: UUID;
    radiogram$!: Observable<ExerciseRadiogram>;
    simulatedRegion$!: Observable<SimulatedRegion | undefined>;

    ownClientId!: UUID;

    status$!: Observable<
        'done' | 'otherAccepted' | 'ownAccepted' | 'unread' | undefined
    >;
    acceptingClient$!: Observable<Client | undefined>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
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
    }

    accept() {
        this.exerciseService.proposeAction({
            type: '[Radiogram] Accept radiogram',
            clientId: this.ownClientId,
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
