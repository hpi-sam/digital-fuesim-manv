import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { UUID, isInSpecificVehicle } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map, switchMap } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectMaterial,
    createSelectPatient,
    createSelectPersonnel,
    createSelectVehicle,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-vehicle-load-unload-controls',
    templateUrl: './vehicle-load-unload-controls.component.html',
    styleUrls: ['./vehicle-load-unload-controls.component.scss'],
})
export class VehicleLoadUnloadControlsComponent implements OnChanges {
    @Input()
    vehicleId!: UUID;

    vehicleLoadState$?: Observable<
        'completelyLoaded' | 'completelyUnloaded' | 'partiallyLoaded'
    >;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnChanges(): void {
        const vehicle$ = this.store.select(createSelectVehicle(this.vehicleId));

        this.vehicleLoadState$ = vehicle$.pipe(
            switchMap((_vehicle) => {
                const materialsAreInVehicle$ = Object.keys(
                    _vehicle.materialIds
                ).map((materialId) =>
                    this.store
                        .select(createSelectMaterial(materialId))
                        .pipe(
                            map((material) =>
                                isInSpecificVehicle(material, _vehicle.id)
                            )
                        )
                );
                const personnelAreInVehicle$ = Object.keys(
                    _vehicle.personnelIds
                ).map((personnelId) =>
                    this.store
                        .select(createSelectPersonnel(personnelId))
                        .pipe(
                            map((personnel) =>
                                isInSpecificVehicle(personnel, _vehicle.id)
                            )
                        )
                );
                const patientsAreInVehicle$ = Object.keys(
                    _vehicle.patientIds
                ).map((patientId) =>
                    this.store
                        .select(createSelectPatient(patientId))
                        .pipe(
                            map((patient) =>
                                isInSpecificVehicle(patient, _vehicle.id)
                            )
                        )
                );
                return combineLatest([
                    ...materialsAreInVehicle$,
                    ...personnelAreInVehicle$,
                    ...patientsAreInVehicle$,
                ]);
            }),
            map((areInVehicle) => {
                if (areInVehicle.every((isInAVehicle) => isInAVehicle)) {
                    return 'completelyLoaded';
                } else if (
                    areInVehicle.every((isInAVehicle) => !isInAVehicle)
                ) {
                    return 'completelyUnloaded';
                }

                return 'partiallyLoaded';
            })
        );
    }

    public unloadVehicle() {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Unload vehicle',
            vehicleId: this.vehicleId,
        });
    }

    public loadVehicle() {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Completely load vehicle',
            vehicleId: this.vehicleId,
        });
    }
}
