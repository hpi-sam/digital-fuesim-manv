import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { MemoizedSelector } from '@ngrx/store';
import { createSelector, Store } from '@ngrx/store';
import type {
    Material,
    Patient,
    PatientStatus,
    Personnel,
    PersonnelType,
    UUID,
    Vehicle,
    WithPosition,
} from 'digital-fuesim-manv-shared';
import {
    isInSpecificSimulatedRegion,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectSimulatedRegion,
    selectMaterials,
    selectPatients,
    selectPersonnel,
    selectVehicleTemplates,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';

const patientCategories = ['red', 'yellow', 'green', 'black'] as const;
type PatientCategories = (typeof patientCategories)[number];

const personnelCategories = [
    'gf',
    'notarzt',
    'notSan',
    'rettSan',
    'san',
] as const;
type PersonnelCategories = (typeof personnelCategories)[number];

@Component({
    selector: 'app-simulated-region-overview-general-tab',
    templateUrl: './simulated-region-overview-general-tab.component.html',
    styleUrls: ['./simulated-region-overview-general-tab.component.scss'],
})
export class SimulatedRegionOverviewGeneralTabComponent implements OnInit {
    @Input() simulatedRegion!: SimulatedRegion;

    public readonly vehicleTemplates$ = this.store.select(
        selectVehicleTemplates
    );

    patients: {
        [Key in `${PatientCategories | 'all'}$`]?: Observable<Patient[]>;
    } = {};

    vehicles$?: Observable<{ [Key in string]?: Vehicle[] }>;

    personnel: {
        [Key in `${PersonnelCategories | 'all'}$`]?: Observable<Personnel[]>;
    } = {};

    material$?: Observable<Material[]>;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        const containedPatientsSelector =
            this.createSelectContainedElements(selectPatients);
        const containedPersonnelSelector =
            this.createSelectContainedElements(selectPersonnel);

        this.patients.all$ = this.store.select(containedPatientsSelector);
        patientCategories.forEach((category) => {
            this.patients[`${category}$`] = this.store.select(
                this.createSelectByPredicate(
                    containedPatientsSelector,
                    this.createPatientStatusPredicate(category)
                )
            );
        });

        this.vehicles$ = this.store.select(
            createSelector(
                selectVehicleTemplates,
                this.createSelectContainedElements(selectVehicles),
                (vehicleTemplates, vehicles) => {
                    const categorizedVehicles: { [Key in string]?: Vehicle[] } =
                        {};

                    categorizedVehicles['all'] = [];

                    vehicleTemplates.forEach((template) => {
                        if (!categorizedVehicles[template.vehicleType]) {
                            categorizedVehicles[template.vehicleType] = [];
                        }
                    });

                    vehicles.forEach((vehicle) => {
                        if (!categorizedVehicles[vehicle.vehicleType]) {
                            categorizedVehicles[vehicle.vehicleType] = [];
                        }

                        categorizedVehicles[vehicle.vehicleType]?.push(vehicle);

                        categorizedVehicles['all']?.push(vehicle);
                    });

                    return categorizedVehicles;
                }
            )
        );

        this.personnel.all$ = this.store.select(containedPersonnelSelector);
        personnelCategories.forEach((category) => {
            this.personnel[`${category}$`] = this.store.select(
                this.createSelectByPredicate(
                    containedPersonnelSelector,
                    this.createPersonnelTypePredicate(category)
                )
            );
        });

        this.material$ = this.store.select(
            this.createSelectContainedElements(selectMaterials)
        );
    }

    createSelectContainedElements<E extends WithPosition>(
        elementsSelector: (state: AppState) => { [key: UUID]: E }
    ) {
        return createSelector(
            createSelectSimulatedRegion(this.simulatedRegion.id),
            elementsSelector,
            (simulatedRegion, elements) =>
                Object.values(elements).filter((e) =>
                    isInSpecificSimulatedRegion(e, simulatedRegion.id)
                )
        );
    }

    createSelectByPredicate<E extends WithPosition>(
        selector: MemoizedSelector<AppState, E[]>,
        predicate: (e: E) => boolean
    ) {
        return createSelector(selector, (elements) =>
            elements.filter((element) => predicate(element))
        );
    }

    createPatientStatusPredicate(
        status: PatientStatus
    ): (patient: Patient) => boolean {
        return (patient) => patient.realStatus === status;
    }

    createPersonnelTypePredicate(
        type: PersonnelType
    ): (personnel: Personnel) => boolean {
        return (patient) => patient.personnelType === type;
    }

    public async renameSimulatedRegion(newName: string) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Rename simulated region',
            simulatedRegionId: this.simulatedRegion.id,
            newName,
        });
    }
}
