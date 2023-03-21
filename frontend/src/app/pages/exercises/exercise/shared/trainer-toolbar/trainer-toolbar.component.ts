import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/core/api.service';
import { ApplicationService } from 'src/app/core/application.service';
import { ConfirmationModalService } from 'src/app/core/confirmation-modal/confirmation-modal.service';
import { ExerciseService } from 'src/app/core/exercise.service';
import { MessageService } from 'src/app/core/messages/message.service';
import { StoreService } from 'src/app/core/store.service';
import { selectExerciseId } from 'src/app/state/application/selectors/application.selectors';
import { selectExerciseStatus } from 'src/app/state/application/selectors/exercise.selectors';
import { selectOwnClient } from 'src/app/state/application/selectors/shared.selectors';
import { openAlarmGroupOverviewModal } from '../alarm-group-overview/open-alarm-group-overview-modal';
import { openClientOverviewModal } from '../client-overview/open-client-overview-modal';
import { openEmergencyOperationsCenterModal } from '../emergency-operations-center/open-emergency-operations-center-modal';
import { openExerciseSettingsModal } from '../exercise-settings/open-exercise-settings-modal';
import { openExerciseStatisticsModal } from '../exercise-statistics/open-exercise-statistics-modal';
import { openHospitalEditorModal } from '../hospital-editor/hospital-editor-modal';
import { openSimulatedRegionsModal } from '../simulated-region-overview/open-simulated-regions-modal';
import { openTransferOverviewModal } from '../transfer-overview/open-transfer-overview-modal';

@Component({
    selector: 'app-trainer-toolbar',
    templateUrl: './trainer-toolbar.component.html',
    styleUrls: ['./trainer-toolbar.component.scss'],
})
export class TrainerToolbarComponent {
    public exerciseStatus$ = this.storeService.select$(selectExerciseStatus);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService,
        private readonly apiService: ApiService,
        public readonly applicationService: ApplicationService,
        private readonly modalService: NgbModal,
        private readonly router: Router,
        private readonly confirmationModalService: ConfirmationModalService,
        private readonly messageService: MessageService
    ) {}

    public openClientOverview() {
        openClientOverviewModal(this.modalService);
    }

    public openTransferOverview() {
        openTransferOverviewModal(this.modalService);
    }

    public openAlarmGroupOverview() {
        openAlarmGroupOverviewModal(this.modalService);
    }

    public openHospitalEditor() {
        openHospitalEditorModal(this.modalService);
    }

    public openEmergencyOperationsCenter() {
        openEmergencyOperationsCenterModal(this.modalService);
    }

    public openExerciseSettings() {
        openExerciseSettingsModal(this.modalService);
    }

    public openExerciseStatisticsModal() {
        openExerciseStatisticsModal(this.modalService);
    }

    public openSimulatedRegions() {
        openSimulatedRegionsModal(this.modalService);
    }

    public async pauseExercise() {
        const response = await this.exerciseService.proposeAction({
            type: '[Exercise] Pause',
        });
        if (response.success) {
            this.sendLogAction(
                `Übung wurde pausiert. (${this.getCurrentDate()})`
            );
        }
    }

    public async startExercise() {
        if (this.storeService.select(selectExerciseStatus) === 'notStarted') {
            const confirmStart = await this.confirmationModalService.confirm({
                title: 'Übung starten',
                description: 'Möchten Sie die Übung wirklich starten?',
            });
            if (!confirmStart) {
                return;
            }
        }
        const response = await this.exerciseService.proposeAction({
            type: '[Exercise] Start',
        });
        if (response.success) {
            this.sendLogAction(
                `Übung wurde gestartet. (${this.getCurrentDate()})`
            );
        }
    }

    private sendLogAction(message: string) {
        this.exerciseService.proposeAction({
            type: '[Emergency Operation Center] Add Log Entry',
            name: this.storeService.select(selectOwnClient)!.name,
            message,
        });
    }

    private getCurrentDate(): string {
        return new Date().toLocaleDateString('de-De', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    public async deleteExercise() {
        const exerciseId = this.storeService.select(selectExerciseId)!;
        const deletionConfirmed = await this.confirmationModalService.confirm({
            title: 'Übung löschen',
            description:
                'Möchten Sie die Übung wirklich unwiederbringlich löschen?',
            confirmationString: exerciseId,
        });
        if (!deletionConfirmed) {
            return;
        }
        // If we get disconnected by the server during the deletion a disconnect error would be displayed
        this.applicationService.leaveExercise();
        this.apiService
            .deleteExercise(exerciseId)
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
}
