import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Patient, uuid } from 'digital-fuesim-manv-shared';
import { map } from 'rxjs';
import { ApiService } from './core/api.service';
import type { AppState } from './state/app.state';
import { selectPatients } from './state/exercise/exercise.selectors';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = 'abcdefghijk';

    public readonly numberOfPatients$ = this.store
        .select(selectPatients)
        .pipe(map((patients) => Object.keys(patients).length));
    constructor(
        public readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    private getDummyPatient() {
        const patient = {
            ...new Patient(
                { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
                'green',
                'green',
                Date.now().toString()
            ),
        };
        const xOffset = Math.random() * 50;
        const yOffset = Math.random() * 25;
        patient.position = {
            x: 1461830 + xOffset,
            y: 6871673 + yOffset,
        };
        return patient;
    }
    // Action
    public async addPatient(patient: Patient = this.getDummyPatient()) {
        patient.vehicleId = uuid();
        const response = await this.apiService.proposeAction(
            {
                type: '[Patient] Add patient',
                patient,
            },
            true
        );
        if (!response.success) {
            console.error(response.message);
        }
    }

    public joinExercise() {
        this.apiService.joinExercise(this.exerciseId);
    }
}
