import { Component } from '@angular/core';
import { ApiService } from './core/api.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    public exerciseId = '';

    public clientName = '';

    public isTrainer = false;

    constructor(public readonly apiService: ApiService) {}

    public joinExercise() {
        this.apiService.joinExercise(
            this.exerciseId,
            this.clientName,
            this.isTrainer ? 'trainer' : 'participant'
        );
    }

    public async createExercise() {
        this.exerciseId = (await this.apiService.createExercise()).exerciseId;
    }
}
