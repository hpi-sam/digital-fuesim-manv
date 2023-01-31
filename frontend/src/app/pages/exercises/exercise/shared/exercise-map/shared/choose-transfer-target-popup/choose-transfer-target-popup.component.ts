import type { OnInit } from '@angular/core';
import { EventEmitter, Output, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Hospital, TransferPoint, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectReachableHospitals,
    createSelectReachableTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
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
    public droppedElementType!: 'personnel' | 'vehicle';

    public transferToCallback!: (
        targetId: UUID,
        targetType: 'hospital' | 'transferPoint'
    ) => void;

    @Output() readonly closePopup = new EventEmitter<void>();

    public reachableTransferPoints$?: Observable<TransferPoint[]>;

    public reachableHospitals$?: Observable<Hospital[]>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.reachableTransferPoints$ = this.store.select(
            createSelectReachableTransferPoints(this.transferPointId)
        );
        this.reachableHospitals$ = this.store.select(
            createSelectReachableHospitals(this.transferPointId)
        );
    }

    public transferTo(targetId: UUID, type: 'hospital' | 'transferPoint') {
        this.transferToCallback(targetId, type);
        this.closePopup.emit();
    }
}
