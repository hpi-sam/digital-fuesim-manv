import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { Vehicle } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectVehicle } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-vehicle-available-slots-display',
    templateUrl: './vehicle-available-slots-display.component.html',
    styleUrls: ['./vehicle-available-slots-display.component.scss'],
})
export class VehicleAvailableSlotsDisplayComponent implements OnChanges {
    @Input()
    vehicleId!: UUID;

    vehicle$!: Observable<Vehicle>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnChanges(): void {
        this.vehicle$ = this.store.select(createSelectVehicle(this.vehicleId));
    }
}
