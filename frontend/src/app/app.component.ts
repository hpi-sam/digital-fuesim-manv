import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { httpOrigin } from './core/api-origins';
import type { AppState } from './state/app.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private readonly store: Store<AppState>) {
        const anyWindow = window as any
        if (anyWindow.Cypress && !environment.production) {
            anyWindow.store = this.store
            anyWindow.backendBaseUrl = httpOrigin
        }
    }
}
