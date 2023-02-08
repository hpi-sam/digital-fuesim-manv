import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { httpOrigin } from './core/api-origins';
import { setupCypressTestingValues } from './shared/functions/cypress';
import type { AppState } from './state/app.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private readonly store: Store<AppState>) {
        setupCypressTestingValues((values) => {
            values.store = this.store
            values.backendBaseUrl = httpOrigin
        })
    }
}
