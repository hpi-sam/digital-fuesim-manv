import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/core/api.service';
import { MessageService } from 'src/app/core/messages/message.service';

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
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    public async createExercise() {
        this.apiService
            .createExercise()
            .then((ids) => {
                this.trainerId = ids.trainerId;
                this.exerciseId = this.trainerId;
                this.participantId = ids.participantId;
                this.exerciseHasBeenCreated = true;

                this.messageService.postMessage(
                    {
                        title: 'Übung erstellt',
                        body: 'Sie können nun der Übung beitreten.',
                        color: 'success',
                    },
                    'toast'
                );
            })
            .catch((error) => {
                this.messageService.postError({
                    title: 'Fehler beim Erstellen der Übung',
                    error: error.message,
                });
            });
    }

    public joinExercise() {
        this.router.navigate(['/exercises', this.exerciseId]);
    }
}
