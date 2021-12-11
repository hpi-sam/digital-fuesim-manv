import { Component } from '@angular/core';
import { uuid, Viewport } from 'digital-fuesim-manv-shared';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = 'abcdefghijk';

    constructor(private readonly apiService: ApiService) {}

    // Action
    public addViewport(
        viewport: Viewport = new Viewport(
            { x: 0, y: 0 },
            { width: 100, height: 100 },
            uuid()
        )
    ) {
        this.apiService.sendAction({
            type: '[Viewport] Add viewport',
            viewport,
        });
    }

    public async joinExercise() {
        console.log(await this.apiService.joinExercise(this.exerciseId));
    }
}
