import '@angular/localize/init';
import {
    Component,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import {
    getElement,
    Patient,
    PatientStatus,
    Personnel,
} from 'digital-fuesim-manv-shared';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import {
    selectConfiguration,
    selectPersonnel,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector:
        'app-simulated-region-overview-behavior-treat-patients-patient-details',
    templateUrl:
        './simulated-region-overview-behavior-treat-patients-patient-details.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-treat-patients-patient-details.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTreatPatientsPatientDetailsComponent
    implements OnInit
{
    @Input() patient!: Patient;
    public caterings$!: Observable<{ personnel: Personnel; len: number }[]>;
    public visibleStatus$?: Observable<PatientStatus>;
    //TODO: Observable bauen was Array ausgibt mit selectoren die ausm state appe rausholen die für einen Patienten catern

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.caterings$ = this.store.select(
            createSelector(selectPersonnel, (personnel) => {
                return Object.values(personnel)
                    .filter(
                        (person) => person.assignedPatientIds[this.patient.id]
                    )
                    .map((person) => {
                        return {
                            personnel: person,
                            len: Object.values(person.assignedPatientIds)
                                .length,
                        };
                    });
            })
        );
        this.visibleStatus$ = this.store.select(
            createSelector(selectConfiguration, (configuration) =>
                Patient.getVisibleStatus(
                    this.patient,
                    configuration.pretriageEnabled,
                    configuration.bluePatientsEnabled
                )
            )
        );
    }
}
