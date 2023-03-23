import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    RecurringEventActivityState,
    ReportableInformation,
    ReportBehaviorState,
} from 'digital-fuesim-manv-shared';
import { reportableInformations, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { Subject, combineLatest, map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityStates,
    createSelectBehaviorState,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-behavior-report',
    templateUrl: './simulated-region-overview-behavior-report.component.html',
    styleUrls: ['./simulated-region-overview-behavior-report.component.scss'],
})
export class SimulatedRegionOverviewBehaviorReportComponent implements OnInit {
    @Input() simulatedRegionId!: UUID;
    @Input() reportBehaviorId!: UUID;

    reportBehaviorState$!: Observable<ReportBehaviorState>;

    activities$!: Observable<{
        [key in ReportableInformation]?: RecurringEventActivityState;
    }>;

    reportableInformations = reportableInformations;
    reportableInformationTranslationMap: {
        [key in ReportableInformation]: string;
    } = {
        patientCount: 'Anzahl an Patienten',
        vehicleCount: 'Anzahl an Fahrzeugen',
        personnelCount: 'Anzahl an Rettungskräften',
        materialCount: 'Anzahl an Material',
        treatmentStatus: 'Behandlungsstatus',
    };

    createReportCollapsed = true;
    selectedInformation: ReportableInformation | 'noSelect' = 'noSelect';

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        this.reportBehaviorState$ = this.store.select(
            createSelectBehaviorState(
                this.simulatedRegionId,
                this.reportBehaviorId
            )
        );

        const activities$ = this.store.select(
            createSelectActivityStates(this.simulatedRegionId)
        );

        this.activities$ = combineLatest([
            this.reportBehaviorState$,
            activities$,
        ]).pipe(
            map(([reportBehaviorState, activities]) =>
                Object.fromEntries(
                    Object.entries(reportBehaviorState.activityIds)
                        .filter(
                            ([_informationType, activityId]) =>
                                activityId && activities[activityId]
                        )
                        .map(([informationType, activityId]) => [
                            informationType,
                            activities[activityId],
                        ])
                )
            )
        );
    }

    updateInterval(informationType: ReportableInformation, interval: string) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update Recurring Report',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            informationType,
            interval: Number(interval) * 1000 * 60,
        });
    }

    removeRepeatingReports(informationType: ReportableInformation) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Remove Recurring Report',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            informationType,
        });
    }

    async createReports(
        informationType: ReportableInformation | 'noSelect',
        interval: string,
        repeating: boolean
    ) {
        if (informationType === 'noSelect') return;

        if (repeating) {
            this.exerciseService.proposeAction({
                type: '[ReportBehavior] Create Recurring Report',
                simulatedRegionId: this.simulatedRegionId,
                behaviorId: this.reportBehaviorId,
                informationType,
                interval: Number(interval) * 1000 * 60,
            });
        } else {
            this.exerciseService.proposeAction({
                type: '[ReportBehavior] Create Report',
                simulatedRegionId: this.simulatedRegionId,
                informationType,
            });
        }
    }
}
