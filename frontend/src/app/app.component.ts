import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { uuid, Viewport } from 'digital-fuesim-manv-shared';
import { ExerciseActions } from './store/excercise/exercise.actions';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private store: Store) {}

    // Action
    public addViewport(
        viewport: Viewport = new Viewport(
            { x: 0, y: 0 },
            { width: 100, height: 100 },
            uuid()
        )
    ) {
        this.store.dispatch(new ExerciseActions.AddViewport(viewport));
    }
}
