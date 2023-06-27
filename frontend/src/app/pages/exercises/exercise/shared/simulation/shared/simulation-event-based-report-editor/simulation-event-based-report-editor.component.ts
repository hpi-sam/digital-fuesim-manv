import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { ReportBehaviorState } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectBehaviorState } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulation-event-based-report-editor',
    templateUrl: './simulation-event-based-report-editor.component.html',
    styleUrls: ['./simulation-event-based-report-editor.component.scss'],
})
export class SimulationEventBasedReportEditorComponent implements OnInit {
    @Input() simulatedRegionId!: UUID;
    @Input() reportBehaviorId!: UUID;

    reportBehaviorState$!: Observable<ReportBehaviorState>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit() {
        this.reportBehaviorState$ = this.store.select(
            createSelectBehaviorState<ReportBehaviorState>(
                this.simulatedRegionId,
                this.reportBehaviorId
            )
        );
    }

    updateReportTreatmentProgressChanges(reportsEnabled: boolean) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update report treatment status changes',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            reportTreatmentProgressChanges: reportsEnabled,
        });
    }

    updateReportTransferOfCategoryInSingleRegionCompleted(
        reportsEnabled: boolean
    ) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update report transfer of category in single region completed',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            reportChanges: reportsEnabled,
        });
    }

    updateReportTransferOfCategoryInMultipleRegionsCompleted(
        reportsEnabled: boolean
    ) {
        this.exerciseService.proposeAction({
            type: '[ReportBehavior] Update report transfer of category in multiple regions completed',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.reportBehaviorId,
            reportChanges: reportsEnabled,
        });
    }
}
