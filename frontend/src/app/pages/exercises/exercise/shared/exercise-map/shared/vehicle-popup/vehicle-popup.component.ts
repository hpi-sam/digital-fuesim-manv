import type { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { isInSpecificVehicle } from 'digital-fuesim-manv-shared';
import type { Vehicle, UUID } from 'digital-fuesim-manv-shared';
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
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
import { PopupService } from '../../utility/popup.service';

@Component({
    selector: 'app-vehicle-popup',
    templateUrl: './vehicle-popup.component.html',
    styleUrls: ['./vehicle-popup.component.scss'],
})
export class VehiclePopupComponent implements OnInit {
    // These properties are only set after OnInit
    public vehicleId!: UUID;

    public vehicle$?: Observable<Vehicle>;
    public vehicleLoadState$?: Observable<
        'completelyLoaded' | 'completelyUnloaded' | 'partiallyLoaded'
    >;
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService,
        private readonly popupService: PopupService
    ) {}

    async ngOnInit() {
        this.vehicle$ = this.store.select(createSelectVehicle(this.vehicleId));
        this.vehicleLoadState$ = this.vehicle$.pipe(
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

    public renameVehicle(name: string) {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Rename vehicle',
            vehicleId: this.vehicleId,
            name,
        });
    }

    public unloadVehicle() {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Unload vehicle',
            vehicleId: this.vehicleId,
        });
        this.popupService.closePopup();
    }

    public loadVehicle() {
        this.exerciseService.proposeAction({
            type: '[Vehicle] Completely load vehicle',
            vehicleId: this.vehicleId,
        });
        this.popupService.closePopup();
    }

    public closePopup() {
        this.popupService.closePopup();
    }
}
