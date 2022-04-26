import { Input, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { ExerciseState } from 'digital-fuesim-manv-shared';
import { ApiService } from 'src/app/core/api.service';
import { ConfirmationModalService } from 'src/app/core/confirmation-modal/confirmation-modal.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { saveBlob } from 'src/app/shared/functions/save-blob';
import type { AppState } from 'src/app/state/app.state';
import { selectLatestStatusHistoryEntry } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';
import { openTransferOverviewModal } from '../transfer-overview/open-transfer-overview-modal';

@Component({
    selector: 'app-trainer-toolbar',
    templateUrl: './trainer-toolbar.component.html',
    styleUrls: ['./trainer-toolbar.component.scss'],
})
export class TrainerToolbarComponent {
    @Input() exerciseId!: string;

    public exercisePausedState$ = this.store.select(
        selectLatestStatusHistoryEntry
    );

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService,
        private readonly modalService: NgbModal,
        private readonly router: Router,
        private readonly confirmationModalService: ConfirmationModalService,
        private readonly messageService: MessageService
    ) {}

    public openClientOverview() {
        openClientOverviewModal(this.modalService, this.exerciseId!);
    }

    public openTransferOverview() {
        openTransferOverviewModal(this.modalService);
    }

    public async pauseExercise() {
        this.apiService.proposeAction({
            type: '[Exercise] Pause',
            timestamp: Date.now(),
        });
    }

    public async startExercise() {
        this.apiService.proposeAction({
            type: '[Exercise] Start',
            timestamp: Date.now(),
        });
    }

    public async deleteExercise() {
        const deletionConfirmed = await this.confirmationModalService.confirm({
            title: 'Übung löschen',
            description:
                'Möchten Sie die Übung wirklich unwiederbringlich löschen?',
            confirmationString: this.exerciseId,
        });
        if (!deletionConfirmed) {
            return;
        }
        // If we get disconnected by the server during the deletion a disconnect error would be displayed
        this.apiService.leaveExercise();
        this.apiService
            .deleteExercise(this.exerciseId)
            .then(
                (response) => {
                    this.messageService.postMessage({
                        title: 'Übung erfolgreich gelöscht',
                        color: 'success',
                    });
                },
                (error) => {
                    this.messageService.postError({
                        title: 'Fehler beim Löschen der Übung',
                        error,
                    });
                }
            )
            .finally(() => {
                this.router.navigate(['/']);
            });
    }

    public exportExerciseState() {
        const blob = new Blob([
            JSON.stringify(getStateSnapshot(this.store).exercise),
        ]);
        saveBlob(blob, `exercise-state-${this.exerciseId}.json`);
    }

    public async importExerciseState(fileList: FileList) {
        try {
            const exerciseStateString = await fileList.item(0)?.text();
            if (!exerciseStateString) {
                throw new Error('No file selected');
            }
            const exerciseState: ExerciseState =
                JSON.parse(exerciseStateString);
            await this.apiService.importExercise(exerciseState);
            location.reload();
        } catch (error: unknown) {
            this.messageService.postError({
                title: 'Fehler beim Importieren der Übung',
                error,
            });
        }
    }
}
