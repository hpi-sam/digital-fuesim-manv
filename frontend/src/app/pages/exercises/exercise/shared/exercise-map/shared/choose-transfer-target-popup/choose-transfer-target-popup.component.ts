import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferPoint, UUID, Vehicle } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { getSelectReachableTransferPoints } from 'src/app/state/exercise/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-choose-transfer-target-popup',
    templateUrl: './choose-transfer-target-popup.component.html',
    styleUrls: ['./choose-transfer-target-popup.component.scss'],
})
export class ChooseTransferTargetPopupComponent
    implements PopupComponent, OnInit
{
    // These properties are only set after OnInit
    public transferPointId!: UUID;
    public droppedElement!: Vehicle;

    @Output() readonly closePopup = new EventEmitter<void>();

    public reachableTransferPoints$?: Observable<TransferPoint[]>;

    constructor(
        public readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.reachableTransferPoints$ = this.store.select(
            getSelectReachableTransferPoints(this.transferPointId)
        );
    }

    public transferTo(transferPoint: TransferPoint) {
        this.apiService.proposeAction({
            type: '[Vehicle] Transfer vehicle',
            vehicleId: this.droppedElement.id,
            startTransferPointId: this.transferPointId,
            targetTransferPointId: transferPoint.id,
        });
        this.closePopup.emit();
    }
}
