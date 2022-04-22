import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferPoint, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
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
    public transferToCallback!: (targetTransferPointId: UUID) => void;

    @Output() readonly closePopup = new EventEmitter<void>();

    public reachableTransferPoints$?: Observable<TransferPoint[]>;

    constructor(public readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.reachableTransferPoints$ = this.store.select(
            getSelectReachableTransferPoints(this.transferPointId)
        );
    }

    public transferTo(transferPoint: TransferPoint) {
        this.transferToCallback(transferPoint.id);
        this.closePopup.emit();
    }
}
