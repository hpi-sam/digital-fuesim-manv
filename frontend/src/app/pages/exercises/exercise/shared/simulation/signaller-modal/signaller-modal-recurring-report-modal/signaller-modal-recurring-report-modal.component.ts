import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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

@Component({
    selector: 'app-signaller-modal-recurring-report-modal',
    templateUrl: './signaller-modal-recurring-report-modal.component.html',
    styleUrls: ['./signaller-modal-recurring-report-modal.component.scss'],
})
export class SignallerModalRecurringReportModalComponent implements OnInit {
    @Input()
    simulatedRegionId!: UUID;

    @Input()
    reportableInformation!: ReportableInformation;

    public get humanReadableReportType() {
        return reportableInformationTypeToGermanNameDictionary[
            this.reportableInformation
        ];
    }

    public reportBehaviorId: UUID | null = null;
    public reportsEnabled = false;
    public reportInterval = 15 * 60 * 1000;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        private readonly activeModal: NgbActiveModal
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
                    reportBehavior.activityIds[this.reportableInformation]
            );

            this.reportsEnabled = !!recurringActivity;
            this.reportInterval =
                recurringActivity?.recurrenceIntervalTime ?? 15 * 60 * 1000;
        }
    }

    public updateInterval(newInterval: string) {
        this.reportInterval = Number(newInterval) * 60 * 1000;
    }

    public changeEnabledState(newState: boolean) {
        if (newState) {
            this.exerciseService.proposeAction({
                type: '[ReportBehavior] Create Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: '', // TODO:
                informationType: this.reportableInformation,
                interval: 0, // TODO:
            });
        } else {
            this.exerciseService.proposeAction({
                type: '[ReportBehavior] Remove Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: '', // TODO:
                informationType: this.reportableInformation,
            });
        }
    }

    public close() {
        this.activeModal.close();
    }
}
