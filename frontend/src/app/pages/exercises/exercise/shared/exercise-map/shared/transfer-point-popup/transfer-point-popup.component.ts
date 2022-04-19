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
} from 'src/app/state/exercise/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

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
                title: 'Names successfully changed',
                color: 'success',
            });
            this.closePopup.emit();
        } else {
            this.messageService.postError({
                title: 'Error when changing names',
                error: response.message,
            });
        }
    }
}
