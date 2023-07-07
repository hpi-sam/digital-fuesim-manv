import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    ReportableInformation,
    UUID,
    reportableInformationTypeToGermanNameDictionary,
} from 'digital-fuesim-manv-shared';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityStatesByType,
    createSelectBehaviorStatesByType,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
import { MessageService } from 'src/app/core/messages/message.service';
import { SignallerModalDetailsService } from '../signaller-modal-details.service';

@Component({
    selector: 'app-signaller-modal-recurring-report-modal',
    templateUrl: './signaller-modal-recurring-report-modal.component.html',
    styleUrls: ['./signaller-modal-recurring-report-modal.component.scss'],
})
export class SignallerModalRecurringReportModalComponent implements OnInit {
    @Input()
    simulatedRegionId!: UUID;

    @Input()
    informationType!: ReportableInformation;

    public get humanReadableReportType() {
        return reportableInformationTypeToGermanNameDictionary[
            this.informationType
        ];
    }

    public reportBehaviorId: UUID | null = null;
    public recurringActivityId: UUID | null = null;
    public reportsEnabled = false;
    public reportInterval = 15 * 60 * 1000;

    public loading = false;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly detailsModal: SignallerModalDetailsService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        const reportBehavior = selectStateSnapshot(
            createSelectBehaviorStatesByType(
                this.simulatedRegionId,
                'reportBehavior'
            ),
            this.store
        )[0];
        const recurringActivities = selectStateSnapshot(
            createSelectActivityStatesByType(
                this.simulatedRegionId,
                'recurringEventActivity'
            ),
            this.store
        );

        if (reportBehavior !== undefined) {
            this.reportBehaviorId = reportBehavior.id;
            const recurringActivity = recurringActivities.find(
                (activity) =>
                    activity.id ===
                    reportBehavior.activityIds[this.informationType]
            );

            this.reportsEnabled = !!recurringActivity;
            this.recurringActivityId = recurringActivity?.id ?? null;
            this.reportInterval =
                recurringActivity?.recurrenceIntervalTime ?? 15 * 60 * 1000;
        }
    }

    public updateInterval(newInterval: string) {
        this.reportInterval = Number(newInterval) * 60 * 1000;
    }

    public submit() {
        if (!this.reportBehaviorId) {
            this.close();
            return;
        }

        let actionPromise: Promise<{ success: boolean }> | null = null;

        if (this.reportsEnabled && !this.recurringActivityId) {
            // Reports are currently not enabled but should be
            actionPromise = this.exerciseService.proposeAction({
                type: '[ReportBehavior] Create Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: this.reportBehaviorId,
                informationType: this.informationType,
                interval: this.reportInterval,
            });
        } else if (this.reportsEnabled && this.recurringActivityId) {
            // Reports are currently enabled and should still be
            actionPromise = this.exerciseService.proposeAction({
                type: '[ReportBehavior] Update Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: this.reportBehaviorId,
                informationType: this.informationType,
                interval: this.reportInterval,
            });
        } else if (!this.reportsEnabled && this.recurringActivityId) {
            // Reports are currently enabled but should not be
            actionPromise = this.exerciseService.proposeAction({
                type: '[ReportBehavior] Remove Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: this.reportBehaviorId,
                informationType: this.informationType,
            });
        } else if (!this.reportsEnabled && !this.recurringActivityId) {
            // Reports are currently not enabled and should not be
            // Do nothing
            actionPromise = Promise.resolve({ success: true });
        }

        this.loading = true;

        if (actionPromise) {
            actionPromise.then((result) => {
                this.loading = false;

                if (result.success) {
                    this.messageService.postMessage({
                        title: 'Befehl erteilt',
                        body: 'Die Einstellungen für den regelmäßigen Bericht wurden angepasst',
                        color: 'success',
                    });
                } else {
                    this.messageService.postError({
                        title: 'Fehler beim Erteilen des Befehls',
                        body: 'Die Einstellungen für den regelmäßigen Bericht wurden angepasst',
                    });
                }

                this.close();
            });
        }
    }

    public close() {
        this.detailsModal.close();
    }
}
