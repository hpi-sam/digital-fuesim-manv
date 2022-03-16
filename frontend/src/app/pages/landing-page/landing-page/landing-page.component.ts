import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent {
    public exerciseId = '';

    public exerciseHasBeenCreated = false;

    public trainerId = '';

    public participantId = '';

    constructor(
        private readonly apiService: ApiService,
        private readonly router: Router
    ) {}

    public async createExercise() {
        const ids = await this.apiService.createExercise();

        this.trainerId = ids.trainerId;
        this.exerciseId = this.trainerId;
        this.participantId = ids.participantId;
        this.exerciseHasBeenCreated = true;
    }

    public joinExercise() {
        this.router.navigate(['/exercises', this.exerciseId]);
    }
}
