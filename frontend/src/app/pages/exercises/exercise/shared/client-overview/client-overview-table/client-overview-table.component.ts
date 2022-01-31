import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectClients,
    selectViewports,
} from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-client-overview-table',
    templateUrl: './client-overview-table.component.html',
    styleUrls: ['./client-overview-table.component.scss'],
})
export class ClientOverviewTableComponent {
    public readonly clients$ = this.store.select(selectClients);
    public readonly viewports$ = this.store.select(selectViewports);

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    public async restrictToViewport(
        clientId: UUID,
        viewportId: UUID | undefined
    ) {
        this.apiService.proposeAction({
            type: '[Client] Restrict to viewport',
            clientId,
            viewportId,
        });
    }

    public async setWaitingRoom(
        clientId: UUID,
        shouldBeInWaitingRoom: boolean
    ) {
        this.apiService.proposeAction({
            type: '[Client] Set waitingroom',
            clientId,
            shouldBeInWaitingRoom,
        });
    }
}
