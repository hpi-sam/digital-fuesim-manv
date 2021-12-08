import { Component } from '@angular/core';
import { ExerciseState } from 'digital-fuesim-manv-shared';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor() {
        // example usage
        const state = new ExerciseState();
    }
}
