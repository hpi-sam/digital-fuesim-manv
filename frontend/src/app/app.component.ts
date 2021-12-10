import { Component } from '@angular/core';
import {
    exerciseActionCreators,
    uuid,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private readonly apiService: ApiService) {}

    // Action
    public addViewport(
        viewport: Viewport = new Viewport(
            { x: 0, y: 0 },
            { width: 100, height: 100 },
            uuid()
        )
    ) {
        this.apiService.sendAction(
            exerciseActionCreators.addViewport({ viewport })
        );
    }
}
