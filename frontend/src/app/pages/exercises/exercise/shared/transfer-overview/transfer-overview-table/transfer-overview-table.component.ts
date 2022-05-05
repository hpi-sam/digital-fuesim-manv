import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectCurrentTime,
    selectExerciseStatus,
    selectPersonnelInTransfer,
    selectTransferPoints,
    selectVehiclesInTransfer,
} from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-transfer-overview-table',
    templateUrl: './transfer-overview-table.component.html',
    styleUrls: ['./transfer-overview-table.component.scss'],
})
export class TransferOverviewTableComponent {
    public readonly vehiclesInTransfer$ = this.store.select(
        selectVehiclesInTransfer
    );
    public readonly personnelInTransfer$ = this.store.select(
        selectPersonnelInTransfer
    );

    public readonly transferPoints$ = this.store.select(selectTransferPoints);

    public readonly currentTime$ = this.store.select(selectCurrentTime);

    public readonly exerciseStatus$ = this.store.select(selectExerciseStatus);

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    public setTransferTarget(
        elementType: 'personnel' | 'vehicles',
        elementId: UUID,
        targetTransferPointId: UUID
    ) {
        this.apiService.proposeAction({
            type: '[Transfer] Edit transfer',
            elementType,
            elementId,
            targetTransferPointId,
        });
    }

    public addTransferTime(
        elementType: 'personnel' | 'vehicles',
        elementId: UUID,
        timeToAdd: number
    ) {
        this.apiService.proposeAction({
            type: '[Transfer] Edit transfer',
            elementType,
            elementId,
            timeToAdd,
        });
    }

    public togglePauseTransfer(
        elementType: 'personnel' | 'vehicles',
        elementId: UUID
    ) {
        this.apiService.proposeAction({
            type: '[Transfer] Toggle pause transfer',
            elementType,
            elementId,
        });
    }
}
