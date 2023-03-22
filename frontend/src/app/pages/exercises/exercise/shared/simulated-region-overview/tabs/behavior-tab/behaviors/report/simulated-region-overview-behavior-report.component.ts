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
import { Subject, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityState,
    createSelectBehaviorState,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-behavior-report',
    templateUrl: './simulated-region-overview-behavior-report.component.html',
    styleUrls: ['./simulated-region-overview-behavior-report.component.scss'],
})
export class SimulatedRegionOverviewBehaviorReportComponent
    implements OnInit, OnDestroy
{
    @Input() simulatedRegionId!: UUID;
    @Input() reportBehaviorId!: UUID;

    private readonly destroy$ = new Subject<void>();

    reportBehaviorState$?: Observable<ReportBehaviorState>;

    activities: {
        [key in ReportableInformation]?: Observable<RecurringEventActivityState>;
    } = {};

    reportableInformations = reportableInformations;
    reportableInformationPluralMap: { [key in ReportableInformation]: string } =
        {
            patientCount: 'Anzahl an Patienten',
            vehicleCount: 'Anzahl an Fahrzeugen',
            personnelCount: 'Anzahl an Rettungskräften',
            materialCount: 'Anzahl an Material',
            treatmentStatus: 'Behandlungsstatus',
        };

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
        this.reportBehaviorState$
            .pipe(takeUntil(this.destroy$))
            .subscribe((reportBehaviorState) => {
                reportableInformations.forEach((information) => {
                    this.activities[information] = this.store.select(
                        createSelectActivityState(
                            this.simulatedRegionId,
                            reportBehaviorState[`${information}ActivityId`]!
                        )
                    );
                });
            });
    }

    updateInterval(information: ReportableInformation, interval: string) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update ReportIntervals',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            [`${information}ReportInterval`]: {
                interval: Number(interval) * 1000 * 60,
            },
        });
    }

    updateEnabled(information: ReportableInformation, enabled: boolean) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update ReportIntervals',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            [`${information}ReportInterval`]: { enabled },
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
