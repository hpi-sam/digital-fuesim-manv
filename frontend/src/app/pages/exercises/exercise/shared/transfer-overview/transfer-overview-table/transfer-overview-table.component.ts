import { Component } from '@angular/core';
import { currentTransferOf } from 'digital-fuesim-manv-shared';
import { StoreService } from 'src/app/core/store.service';
import {
    selectExerciseStatus,
    selectPersonnelInTransfer,
    selectVehiclesInTransfer,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-transfer-overview-table',
    templateUrl: './transfer-overview-table.component.html',
    styleUrls: ['./transfer-overview-table.component.scss'],
})
export class TransferOverviewTableComponent {
    public readonly vehiclesInTransfer$ = this.storeService.select$(
        selectVehiclesInTransfer
    );
    public readonly personnelInTransfer$ = this.storeService.select$(
        selectPersonnelInTransfer
    );

    public currentTransferOf = currentTransferOf;

    public readonly exerciseStatus$ =
        this.storeService.select$(selectExerciseStatus);

    constructor(private readonly storeService: StoreService) {}
}
