import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Transfer, UUID } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectTransferPoints } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-transfer-target-input',
    templateUrl: './transfer-target-input.component.html',
    styleUrls: ['./transfer-target-input.component.scss'],
})
export class TransferTargetInputComponent {
    @Input() elementType!: 'personnel' | 'vehicles';
    @Input() elementId!: UUID;
    @Input() transfer!: Transfer;

    public readonly transferPoints$ = this.store.select(selectTransferPoints);

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    public setTransferTarget(targetTransferPointId: UUID) {
        this.apiService.proposeAction({
            type: '[Transfer] Edit transfer',
            elementType: this.elementType,
            elementId: this.elementId,
            targetTransferPointId,
        });
    }
}
