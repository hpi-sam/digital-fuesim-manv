import type { OnDestroy } from '@angular/core';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ApplicationService } from 'src/app/core/application.service';
import { MessageService } from 'src/app/core/messages/message.service';

@Component({
    selector: 'app-join-exercise-modal',
    templateUrl: './join-exercise-modal.component.html',
    styleUrls: ['./join-exercise-modal.component.scss'],
})
export class JoinExerciseModalComponent implements OnDestroy {
    public exerciseId!: string;
    public clientName = '';
    public agreedToTermsAndPrivacyPolicy = false;
    /**
     * Emits true when the exercise was successfully joined.
     * If it completes without emitting a value or emits false, the exercise couldn't be joined.
     */
    public exerciseJoined$ = new Subject<boolean>();

    constructor(
        private readonly applicationService: ApplicationService,
        private readonly activeModal: NgbActiveModal,
        private readonly messageService: MessageService
    ) {}

    public toggleAgreedToTermsAndPrivacyPolicy(event: boolean) {
        this.agreedToTermsAndPrivacyPolicy = event;
    }

    public async joinExercise() {
        if (this.agreedToTermsAndPrivacyPolicy) {
            const successfullyJoined =
                await this.applicationService.joinExercise(
                    this.exerciseId,
                    this.clientName
                );
            this.exerciseJoined$.next(successfullyJoined);
            this.activeModal.close();
        } else {
            this.messageService.postMessage({
                title: 'Fehler: Bedinungen nicht zugestimmt',
                color: 'warning',
            });
        }
    }

    public close() {
        this.activeModal.close();
    }

    ngOnDestroy() {
        this.exerciseJoined$.complete();
    }
}
