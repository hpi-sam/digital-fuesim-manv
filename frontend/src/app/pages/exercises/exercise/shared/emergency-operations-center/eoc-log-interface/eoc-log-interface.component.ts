import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
    selectEocLogEntries,
} from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';

@Component({
    selector: 'app-eoc-log-interface',
    templateUrl: './eoc-log-interface.component.html',
    styleUrls: ['./eoc-log-interface.component.scss'],
})
export class EocLogInterfaceComponent {
    public readonly eocLogEntries$ = this.store
        .select(selectEocLogEntries)
        // We want to display the most recent message at the top
        .pipe(map((logEntries) => [...logEntries].reverse()));

    public newLogEntry = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    public async addEocLogEntry() {
        const response = await this.apiService.proposeAction({
            type: '[Emergency Operation Center] Add Log Entry',
            message: this.newLogEntry,
            name: getSelectClient(this.apiService.ownClientId!)(
                getStateSnapshot(this.store)
            ).name,
        });
        if (response.success) {
            this.newLogEntry = '';
        }
    }
}
