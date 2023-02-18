import { Component } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    selectClients,
    selectViewports,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-client-overview-table',
    templateUrl: './client-overview-table.component.html',
    styleUrls: ['./client-overview-table.component.scss'],
})
export class ClientOverviewTableComponent {
    public readonly clients$ = this.storeService.select$(selectClients);
    public readonly viewports$ = this.storeService.select$(selectViewports);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService
    ) {}

    public async restrictToViewport(
        clientId: UUID,
        viewportId: UUID | undefined
    ) {
        this.exerciseService.proposeAction({
            type: '[Client] Restrict to viewport',
            clientId,
            viewportId,
        });
    }

    public async setWaitingRoom(
        clientId: UUID,
        shouldBeInWaitingRoom: boolean
    ) {
        this.exerciseService.proposeAction({
            type: '[Client] Set waitingroom',
            clientId,
            shouldBeInWaitingRoom,
        });
    }
}
