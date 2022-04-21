import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map, switchMap } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectMaterial,
    getSelectPatient,
    getSelectPersonnel,
    getSelectVehicle,
} from 'src/app/state/exercise/exercise.selectors';
import type { PopupComponent } from '../../utility/popup-manager';

@Component({
    selector: 'app-vehicle-popup',
    templateUrl: './vehicle-popup.component.html',
    styleUrls: ['./vehicle-popup.component.scss'],
})
export class VehiclePopupComponent implements PopupComponent, OnInit {
    // These properties are only set after OnInit
    public vehicleId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public vehicle$?: Observable<Vehicle>;
    public vehicleIsCompletelyUnloaded$?: Observable<boolean>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    ngOnInit(): void {
        this.vehicle$ = this.store.select(getSelectVehicle(this.vehicleId));
        this.vehicleIsCompletelyUnloaded$ = this.vehicle$.pipe(
            switchMap((vehicle) => {
                const materialsAreInVehicle$ = Object.keys(
                    vehicle.materialIds
                ).map((materialId) =>
                    this.store
                        .select(getSelectMaterial(materialId))
                        .pipe(
                            map((material) => material.position === undefined)
                        )
                );
                const personnelIsInVehicle$ = Object.keys(
                    vehicle.personnelIds
                ).map((personnelId) =>
                    this.store.select(getSelectPersonnel(personnelId)).pipe(
                        // TODO: only if the person is not in transfer
                        map((personnel) => personnel.position === undefined)
                    )
                );
                const patientIsInVehicle$ = Object.keys(vehicle.patientIds).map(
                    (patientId) =>
                        this.store
                            .select(getSelectPatient(patientId))
                            .pipe(
                                map(
                                    (personnel) =>
                                        personnel.position === undefined
                                )
                            )
                );
                return combineLatest([
                    ...materialsAreInVehicle$,
                    ...personnelIsInVehicle$,
                    ...patientIsInVehicle$,
                ]);
            }),
            map((areInVehicle) =>
                areInVehicle.every((isInVehicle) => !isInVehicle)
            )
        );
    }

    public unloadVehicle() {
        this.apiService.proposeAction({
            type: '[Vehicle] Unload vehicle',
            vehicleId: this.vehicleId,
        });
        this.closePopup.emit();
    }
}
