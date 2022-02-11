import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, Vehicle } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { getSelectVehicle } from 'src/app/state/exercise/exercise.selectors';
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

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.vehicle$ = this.store.select(getSelectVehicle(this.vehicleId));
    }
}
