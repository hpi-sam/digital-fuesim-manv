import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectPatientTemplates,
    selectVehicleTemplates,
} from 'src/app/state/exercise/exercise.selectors';
import { DragElementService } from '../core/drag-element.service';

@Component({
    selector: 'app-trainer-map-editor',
    templateUrl: './trainer-map-editor.component.html',
    styleUrls: ['./trainer-map-editor.component.scss'],
})
/**
 * A wrapper around the map and the map-editor-side-panel (TBD) that provides trainers with the ability to edit the map of an exercise (add/delete/move patients, vehicles, ...).
 * TODO: this is mostly a proof of concept, and in no way a final implementation.
 */
export class TrainerMapEditorComponent {
    @Input() exerciseId!: string;

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    public readonly patientTemplates$ = this.store.select(
        selectPatientTemplates
    );

    constructor(
        public readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly dragElementService: DragElementService
    ) {}
}
