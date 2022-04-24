import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import { Material, Patient, Personnel } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, firstValueFrom, map, switchMap } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectClient,
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

    public readonly client$ = this.store.select(
        getSelectClient(this.apiService.ownClientId!)
    );

    public name?: string;

    constructor(
        private readonly store: Store<AppState>,
        private readonly apiService: ApiService
    ) {}

    async ngOnInit() {
        this.vehicle$ = this.store.select(getSelectVehicle(this.vehicleId));
        this.vehicleIsCompletelyUnloaded$ = this.vehicle$.pipe(
            switchMap((_vehicle) => {
                const materialIsInVehicle$ = this.store
                    .select(getSelectMaterial(_vehicle.materialId))
                    .pipe(map((material) => Material.isInVehicle(material)));
                const personnelIsInVehicle$ = Object.keys(
                    _vehicle.personnelIds
                ).map((personnelId) =>
                    this.store
                        .select(getSelectPersonnel(personnelId))
                        .pipe(
                            map((personnel) => Personnel.isInVehicle(personnel))
                        )
                );
                const patientIsInVehicle$ = Object.keys(
                    _vehicle.patientIds
                ).map((patientId) =>
                    this.store
                        .select(getSelectPatient(patientId))
                        .pipe(map((patient) => Patient.isInVehicle(patient)))
                );
                return combineLatest([
                    materialIsInVehicle$,
                    ...personnelIsInVehicle$,
                    ...patientIsInVehicle$,
                ]);
            }),
            map((areInVehicle) =>
                areInVehicle.every((isInVehicle) => !isInVehicle)
            )
        );

        const vehicle = await firstValueFrom(this.vehicle$);
        this.name = vehicle.name;
    }

    public renameVehicle() {
        this.apiService.proposeAction({
            type: '[Vehicle] Rename vehicle',
            vehicleId: this.vehicleId,
            name: this.name!,
        });
    }

    public unloadVehicle() {
        this.apiService.proposeAction({
            type: '[Vehicle] Unload vehicle',
            vehicleId: this.vehicleId,
        });
        this.closePopup.emit();
    }
}
