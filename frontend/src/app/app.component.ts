import { Component } from '@angular/core';
import { Patient, uuid } from 'digital-fuesim-manv-shared';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = 'abcdefghijk';

    public clientName = '';

    public beTrainer = false;

    constructor(public readonly apiService: ApiService) {}

    // Action
    public async addPatient(
        patient: Patient = new Patient(
            { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
            'green',
            'green',
            Date.now().toString()
        )
    ) {
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

    public keepAddingPatients = true;
    public joinExercise() {
        this.apiService.joinExercise(this.exerciseId, this.clientName, this.beTrainer ? 'trainer' : 'participant');
        // setInterval(() => {
        //     if (this.keepAddingPatients) {
        //         this.addPatient();
        //     }
        // }, 1000);
    }
}
