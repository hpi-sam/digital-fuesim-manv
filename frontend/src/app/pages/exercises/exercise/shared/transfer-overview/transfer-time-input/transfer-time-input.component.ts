import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Transfer, UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentTime } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-transfer-time-input',
    templateUrl: './transfer-time-input.component.html',
    styleUrls: ['./transfer-time-input.component.scss'],
})
export class TransferTimeInputComponent {
    @Input() elementType!: 'personnel' | 'vehicles';

    @Input() elementId!: UUID;

    @Input() transfer!: Transfer;

    public readonly currentTime$ = this.store.select(selectCurrentTime);

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    public addTransferTime(timeToAdd: number) {
        this.apiService.proposeAction({
            type: '[Transfer] Edit transfer',
            elementType: this.elementType,
            elementId: this.elementId,
            timeToAdd,
        });
    }

    public togglePauseTransfer() {
        this.apiService.proposeAction({
            type: '[Transfer] Toggle pause transfer',
            elementType: this.elementType,
            elementId: this.elementId,
        });
    }

    public letElementArrive() {
        this.apiService.proposeAction({
            type: '[Transfer] Finish transfer',
            elementType: this.elementType,
            elementId: this.elementId,
            targetTransferPointId: this.transfer.targetTransferPointId,
        });
    }
}
