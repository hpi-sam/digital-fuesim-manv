import '@angular/localize/init';
import {
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import {
    getElement,
    Patient,
    PatientStatus,
    PatientStatusCode,
    Personnel,
    PersonnelType,
    UUID,
} from 'digital-fuesim-manv-shared';
import {
    distinct,
    distinctUntilChanged,
    filter,
    Observable,
    Subject,
    takeUntil,
} from 'rxjs';
import { AppState } from 'src/app/state/app.state';
import {
    createSelectPatient,
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
    implements OnInit, OnDestroy
{
    @Input() patientId!: UUID;
    @Input() cateringsActive!: boolean;

    public caterings$!: Observable<
        { personnelType: PersonnelType; len: number }[]
    >;
    public visibleStatus$?: Observable<PatientStatus>;
    public patient$!: Observable<Patient>;
    public destroy$ = new Subject<void>();

    constructor(private readonly store: Store<AppState>) {}
    ngOnDestroy(): void {
        this.destroy$.next();
    }

    ngOnInit(): void {
        this.caterings$ = this.store
            .select(
                createSelector(selectPersonnel, (personnel) => {
                    return Object.values(personnel)
                        .filter(
                            (person) =>
                                person.assignedPatientIds[this.patientId]
                        )
                        .map((person) => {
                            return {
                                personnelType: person.personnelType,
                                len: Object.values(person.assignedPatientIds)
                                    .length,
                            };
                        });
                })
            )
            .pipe(
                takeUntil(this.destroy$),
                distinctUntilChanged((a, b) => {
                    return (
                        Array.isArray(a) &&
                        Array.isArray(b) &&
                        a.length === b.length &&
                        a.every(
                            (val, index) =>
                                val.len === b[index]?.len &&
                                val.personnelType === b[index]?.personnelType
                        )
                    );
                })
            );

        const patientSelector = createSelectPatient(this.patientId);

        this.patient$ = this.store.select(patientSelector);

        this.visibleStatus$ = this.store.select(
            createSelector(
                patientSelector,
                selectConfiguration,
                (patient, configuration) => {
                    if (patient === undefined) {
                        return 'white';
                    }
                    return Patient.getVisibleStatus(
                        patient,
                        configuration.pretriageEnabled,
                        configuration.bluePatientsEnabled
                    );
                }
            )
        );
    }
}
