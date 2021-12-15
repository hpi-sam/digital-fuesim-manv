import { Component } from '@angular/core';
import { Patient } from 'digital-fuesim-manv-shared';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = 'abcdefghijk';

    constructor(public readonly apiService: ApiService) {}

    // Action
    public addPatient(
        patient: Patient = new Patient(
            { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
            'green',
            'green',
            Date.now().toString()
        )
    ) {
        this.apiService.proposeAction({
            type: '[Patient] Add patient',
            patient,
        });
    }

    public keepAddingPatients = true;
    public async joinExercise() {
        this.apiService.joinExercise(this.exerciseId);
        setInterval(() => {
            if (this.keepAddingPatients) {
                this.addPatient();
            }
        }, 1000);
    }
}
