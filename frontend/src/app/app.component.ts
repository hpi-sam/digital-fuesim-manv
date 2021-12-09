import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { uuid, Viewport, addViewport } from 'digital-fuesim-manv-shared';
import { AppState } from './state/app.state';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private readonly store: Store<AppState>) {}

    // Action
    public addViewport(
        viewport: Viewport = new Viewport(
            { x: 0, y: 0 },
            { width: 100, height: 100 },
            uuid()
        )
    ) {
        this.store.dispatch(addViewport({ viewport }));
    }
}
