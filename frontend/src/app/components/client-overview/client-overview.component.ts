import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from '../../core/api.service';
import type { AppState } from '../../state/app.state';
import {
    selectClients,
    selectViewports,
} from '../../state/exercise/exercise.selectors';

@Component({
    selector: 'app-client-overview',
    templateUrl: './client-overview.component.html',
    styleUrls: ['./client-overview.component.scss'],
})
export class ClientOverviewComponent {
    public readonly clients$ = this.store.select(selectClients);
    public readonly viewports$ = this.store.select(selectViewports);
    public readonly columnsToDisplay = ['name', 'role'];
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
}
