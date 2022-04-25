import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Viewport } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    getSelectViewport,
} from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-viewport-popup',
    templateUrl: './viewport-popup.component.html',
    styleUrls: ['./viewport-popup.component.scss'],
})
export class ViewportPopupComponent implements OnInit {
    // These properties are only set after OnInit
    public viewportId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public viewport$?: Observable<Viewport>;

    public readonly client$ = this.store.select(
        getSelectClient(this.apiService.ownClientId!)
    );

    public name?: string;

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly messageService: MessageService
    ) {}

    async ngOnInit() {
        this.viewport$ = this.store.select(getSelectViewport(this.viewportId));

        // Set the initial form values
        const viewport = await firstValueFrom(this.viewport$);
        this.name = viewport.name;
    }

    public async saveName() {
        const response = await this.apiService.proposeAction({
            type: '[Viewport] Rename viewport',
            viewportId: this.viewportId,
            newName: this.name!,
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Ansicht erfolgreich umbenannt',
                color: 'success',
            });
            this.closePopup.emit();
        }
    }
}
