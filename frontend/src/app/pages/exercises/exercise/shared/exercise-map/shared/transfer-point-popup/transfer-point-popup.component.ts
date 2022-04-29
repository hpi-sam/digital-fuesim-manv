import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { TransferPoint, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    getSelectTransferPoint,
    selectTransferPoints,
} from 'src/app/state/exercise/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: 'connections' | 'names' = 'names';

@Component({
    selector: 'app-transfer-point-popup',
    templateUrl: './transfer-point-popup.component.html',
    styleUrls: ['./transfer-point-popup.component.scss'],
})
export class TransferPointPopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public transferPointId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public transferPoint$?: Observable<TransferPoint>;

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: 'connections' | 'names') {
        activeNavId = value;
    }

    public transferPoints$ = this.store.select(selectTransferPoints);

    /**
     * All transferPoints that are neither connected to this one nor this one itself
     */
    public readonly transferPointsToBeAdded$ = this.store.select((state) => {
        const transferPoints = state.exercise.transferPoints;
        const currentTransferPoint = transferPoints[this.transferPointId];
        return Object.fromEntries(
            Object.entries(transferPoints).filter(
                ([key]) =>
                    key !== this.transferPointId &&
                    !currentTransferPoint.reachableTransferPoints[key]
            )
        );
    });

    public readonly client$ = this.store.select(
        getSelectClient(this.apiService.ownClientId!)
    );

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    public internalName?: string;
    public externalName?: string;

    async ngOnInit() {
        this.transferPoint$ = this.store.select(
            getSelectTransferPoint(this.transferPointId)
        );

        // Set the initial form values
        const transferPoint = await firstValueFrom(this.transferPoint$);
        this.internalName = transferPoint.internalName;
        this.externalName = transferPoint.externalName;
    }

    public async saveTransferPointNames() {
        const response = await this.apiService.proposeAction({
            type: '[TransferPoint] Rename TransferPoint',
            transferPointId: this.transferPointId,
            internalName: this.internalName!,
            externalName: this.externalName!,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Transferpunkt erfolgreich umbenannt',
                color: 'success',
            });
            this.closePopup.emit();
        }
    }

    public connectTransferPoint(transferPointId: UUID, duration?: number) {
        this.apiService.proposeAction({
            type: '[TransferPoint] Connect TransferPoints',
            transferPointId1: this.transferPointId,
            transferPointId2: transferPointId,
            duration,
        });
    }

    public disconnectTransferPoint(transferPointId: UUID) {
        this.apiService.proposeAction({
            type: '[TransferPoint] Disconnect TransferPoints',
            transferPointId1: this.transferPointId,
            transferPointId2: transferPointId,
        });
    }
}
