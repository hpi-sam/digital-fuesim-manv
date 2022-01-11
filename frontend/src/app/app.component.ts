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

    constructor(public readonly apiService: ApiService) {}

    private getDummyPatient() {
        const patient = new Patient(
            { hair: 'brown', eyeColor: 'blue', name: 'John Doe', age: 42 },
            'green',
            'green',
            Date.now().toString()
        );
        patient.position = { x: 1461752.9315300942, y: 6871641.509884497 };
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
