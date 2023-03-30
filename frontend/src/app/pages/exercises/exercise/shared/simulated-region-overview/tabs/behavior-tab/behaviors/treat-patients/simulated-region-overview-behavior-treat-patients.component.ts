import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { UUID, VehicleTemplate } from 'digital-fuesim-manv-shared';
import type { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    TreatPatientsBehaviorState,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectBehaviorState,
    createSelectElementsInSimulatedRegion,
    selectConfiguration,
    selectPatients,
    selectVehicleTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';
import { SelectPatientService } from '../../../../select-patient.service';
import { comparePatientsByVisibleStatus } from '../../../compare-patients';

let globalLastSettingsCollapsed = true;
let globalLastInformationCollapsed = true;
@Component({
    selector: 'app-simulated-region-overview-behavior-treat-patients',
    templateUrl:
        './simulated-region-overview-behavior-treat-patients.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-treat-patients.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTreatPatientsComponent
    implements OnInit
{
    @Input() simulatedRegion!: SimulatedRegion;
    @Input() treatPatientsBehaviorState!: TreatPatientsBehaviorState;
    public patientIds$!: Observable<UUID[]>;
    public vehicleTemplatesToAdd$!: Observable<readonly VehicleTemplate[]>;
    public vehicleTemplatesPriority$!: Observable<readonly VehicleTemplate[]>;

    private _settingsCollapsed!: boolean;
    private _informationCollapsed!: boolean;

    public get settingsCollapsed(): boolean {
        return this._settingsCollapsed;
    }
    public set settingsCollapsed(value: boolean) {
        this._settingsCollapsed = value;
        globalLastSettingsCollapsed = value;
    }
    public get informationCollapsed(): boolean {
        return this._informationCollapsed;
    }
    public set informationCollapsed(value: boolean) {
        this._informationCollapsed = value;
        globalLastInformationCollapsed = value;
    }

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>,
        readonly selectPatientService: SelectPatientService
    ) {}

    ngOnInit(): void {
        this.settingsCollapsed = globalLastSettingsCollapsed;
        this.informationCollapsed = globalLastInformationCollapsed;
        this.patientIds$ = this.store.select(
            createSelector(
                createSelectElementsInSimulatedRegion(
                    selectPatients,
                    this.simulatedRegion.id
                ),
                selectConfiguration,
                (patients, configuration) =>
                    patients
                        .sort((patientA, patientB) =>
                            comparePatientsByVisibleStatus(
                                patientA,
                                patientB,
                                configuration
                            )
                        )
                        .map((patient) => patient.id)
            )
        );

        const behaviorState$ = this.store.select(
            createSelectBehaviorState<TreatPatientsBehaviorState>(
                this.simulatedRegion.id,
                this.treatPatientsBehaviorState.id
            )
        );

        const ownVehicleTemplateIds$ = behaviorState$.pipe(
            map((behaviorState) => behaviorState.vehicleTemplatePriorities)
        );
        const availableVehicleTemplates$ = this.store.select(
            selectVehicleTemplates
        );
        this.vehicleTemplatesPriority$ = combineLatest(
            [availableVehicleTemplates$, ownVehicleTemplateIds$],
            (templates, ownIds) => {
                const templateMap = Object.fromEntries(
                    templates.map((template) => [template.id, template])
                );
                return ownIds.map((id) => templateMap[id]!);
            }
        );
        this.vehicleTemplatesToAdd$ = combineLatest(
            [availableVehicleTemplates$, ownVehicleTemplateIds$],
            (templates, ownIds) =>
                templates.filter((template) => !ownIds.includes(template.id))
        );
    }

    public updateTreatPatientsBehaviorState(
        unknown?: number,
        counted?: number,
        triaged?: number,
        secured?: number,
        countingTimePerPatient?: number
    ) {
        this.exerciseService.proposeAction({
            type: '[TreatPatientsBehavior] Update TreatPatientsIntervals',
            simulatedRegionId: this.simulatedRegion.id,
            behaviorStateId: this.treatPatientsBehaviorState.id,
            unknown,
            counted,
            triaged,
            secured,
            countingTimePerPatient,
        });
    }

    public vehiclePriorityDrop({
        item: { data: id },
        currentIndex,
    }: CdkDragDrop<UUID[]>) {
        const newPriorities =
            this.treatPatientsBehaviorState.vehicleTemplatePriorities.filter(
                (item) => item !== id
            );
        newPriorities.splice(currentIndex, 0, id);
        this.proposeVehiclePriorities(newPriorities);
    }

    public vehiclePriorityRemove(id: UUID) {
        this.proposeVehiclePriorities(
            this.treatPatientsBehaviorState.vehicleTemplatePriorities.filter(
                (item) => item !== id
            )
        );
    }

    public vehiclePriorityAdd(id: UUID) {
        this.proposeVehiclePriorities([
            id,
            ...this.treatPatientsBehaviorState.vehicleTemplatePriorities,
        ]);
    }

    private proposeVehiclePriorities(newPriorities: UUID[]) {
        this.exerciseService.proposeAction(
            {
                type: '[TreatPatientsBehavior] Update VehiclePriorities',
                simulatedRegionId: this.simulatedRegion.id,
                behaviorId: this.treatPatientsBehaviorState.id,
                priorities: newPriorities,
            },
            true
        );
    }
}
