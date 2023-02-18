import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import { isInVehicle } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map, switchMap } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectMaterial,
    createSelectPatient,
    createSelectPersonnel,
    createSelectVehicle,
} from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';
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
    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService
    ) {}

    async ngOnInit() {
        this.vehicle$ = this.storeService.select$(
            createSelectVehicle(this.vehicleId)
        );
        this.vehicleIsCompletelyUnloaded$ = this.vehicle$.pipe(
            switchMap((_vehicle) => {
                const materialsAreInVehicle$ = Object.keys(
                    _vehicle.materialIds
                ).map((materialId) =>
                    this.storeService
                        .select$(createSelectMaterial(materialId))
                        .pipe(map((material) => isInVehicle(material)))
                );
                const personnelAreInVehicle$ = Object.keys(
                    _vehicle.personnelIds
                ).map((personnelId) =>
                    this.storeService
                        .select$(createSelectPersonnel(personnelId))
                        .pipe(map((personnel) => isInVehicle(personnel)))
                );
                const patientsAreInVehicle$ = Object.keys(
                    _vehicle.patientIds
                ).map((patientId) =>
                    this.storeService
                        .select$(createSelectPatient(patientId))
                        .pipe(map((patient) => isInVehicle(patient)))
                );
                return combineLatest([
                    ...materialsAreInVehicle$,
                    ...personnelAreInVehicle$,
                    ...patientsAreInVehicle$,
                ]);
            }),
            map((areInVehicle) =>
                areInVehicle.every((isInAVehicle) => !isInAVehicle)
            )
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
        this.closePopup.emit();
    }
}
