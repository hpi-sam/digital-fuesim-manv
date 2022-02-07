import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ImmutableJsonObject } from 'digital-fuesim-manv-shared';
import { Patient, uuid } from 'digital-fuesim-manv-shared';
import { map } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    selectMaterials,
    selectPatients,
    selectPersonell,
    selectVehicles,
} from 'src/app/state/exercise/exercise.selectors';
import { DragElementService } from '../core/drag-element.service';
import { startingPosition } from '../starting-position';

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

    private readonly getNumberOf = map(
        (dictionary: ImmutableJsonObject) => Object.keys(dictionary).length
    );

    public readonly vehicleTemplates$ = this.store.select(
        (state) => state.exercise.vehicleTemplates
    );

    public readonly numberOfPatients$ = this.store
        .select(selectPatients)
        .pipe(this.getNumberOf);
    public readonly numberOfVehicles$ = this.store
        .select(selectVehicles)
        .pipe(this.getNumberOf);
    public readonly numberOfPersonell$ = this.store
        .select(selectPersonell)
        .pipe(this.getNumberOf);
    public readonly numberOfMaterials$ = this.store
        .select(selectMaterials)
        .pipe(this.getNumberOf);

    constructor(
        public readonly apiService: ApiService,
        private readonly store: Store<AppState>,
        public readonly dragElementService: DragElementService
    ) {}

    private generateCoordinates() {
        const xOffset = Math.random() * 300;
        const yOffset = Math.random() * 250;
        return {
            x: startingPosition.x + xOffset,
            y: startingPosition.y + yOffset,
        };
    }

    public async addPatient() {
        const patient = {
            ...new Patient(
                { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
                'green',
                'green',
                Date.now().toString()
            ),
            position: this.generateCoordinates(),
            vehicleId: uuid(),
        };
        this.apiService.proposeAction(
            {
                type: '[Patient] Add patient',
                patient,
            },
            false
        );
    }

    public addMultiple(numberOfElements: number, key: 'addPatient') {
        for (let i = 0; i < numberOfElements; i++) {
            this[key]();
        }
    }
}
