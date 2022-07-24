import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ImmutableDate } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';
import type { AppState } from 'src/app/state/app.state';
import { selectEocLogEntries } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-eoc-log-interface',
    templateUrl: './eoc-log-interface.component.html',
    styleUrls: ['./eoc-log-interface.component.scss'],
})
export class EocLogInterfaceComponent {
    public readonly eocLogEntries$ = this.store.select(selectEocLogEntries);

    public message = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        private readonly messageService: MessageService
    ) {}

    public formatDate(dateString: ImmutableDate): string {
        // The date is actually provided as a string, regardless of the actual type
        const date = new Date(dateString as unknown as string);
        return date.toLocaleString();
    }

    public async addEocLogEntry() {
        const clientId = this.apiService.ownClientId;
        if (!clientId) {
            this.messageService.postMessage({
                title: 'Kann keinen Log-Eintrag erstellen!',
                body:
                    clientId === null
                        ? 'Zeitreise aktiviert'
                        : 'Keiner Übung beigetreten',
                color: 'danger',
            });
            return;
        }
        const response = await this.apiService.proposeAction({
            type: '[Emergency Operation Center] Add Log Entry',
            message: this.message,
            name: getStateSnapshot(this.store).exercise.clients[clientId]!.name,
            timestamp: Date.now(),
        });
        if (response.success) {
            this.messageService.postMessage({
                title: 'Log-Eintrag hinzugefügt!',
                color: 'success',
            });
            this.message = '';
        }
    }
}
