import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { AppState } from 'src/app/state/app.state';
import {
    selectExerciseStatus,
    selectPersonnelInTransfer,
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

    public readonly exerciseStatus$ = this.store.select(selectExerciseStatus);

    constructor(private readonly store: Store<AppState>) {}
}
