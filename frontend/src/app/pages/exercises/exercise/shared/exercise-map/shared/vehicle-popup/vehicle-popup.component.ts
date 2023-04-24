import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Vehicle, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectVehicle } from 'src/app/state/application/selectors/exercise.selectors';
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
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(private readonly store: Store<AppState>) {}

    async ngOnInit() {
        this.vehicle$ = this.store.select(createSelectVehicle(this.vehicleId));
    }
}
