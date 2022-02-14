import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import {
    getSelectMaterial,
    getSelectPersonell,
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
                const material$ = this.store.select(
                    getSelectMaterial(vehicle.materialId)
                );
                const personnel$ = Object.keys(vehicle.personellIds).map(
                    (personnelId) =>
                        this.store.select(getSelectPersonell(personnelId))
                );
                return combineLatest([material$, ...personnel$]);
            }),
            map(([material, ...personnel]) => {
                if (material.position === undefined) {
                    return false;
                }
                return !personnel.some(
                    (personal) => personal.position === undefined
                );
            })
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
