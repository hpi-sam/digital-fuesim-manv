import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import { VehicleCountRadiogram } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectSimulatedRegion } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-vehicle-count',
    templateUrl: './radiogram-card-content-vehicle-count.component.html',
    styleUrls: ['./radiogram-card-content-vehicle-count.component.scss'],
})
export class RadiogramCardContentVehicleCountComponent implements OnInit {
    @Input() radiogram!: VehicleCountRadiogram;
    totalVehicleCount!: number;
    simulatedRegionName$!: Observable<string>;
    vehicleCounts!: { vehicleName: string; vehicleCount: number }[];

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.vehicleCounts = Object.entries(this.radiogram.vehicleCount).map(
            ([vehicleName, vehicleCount]) => ({ vehicleName, vehicleCount })
        );

        this.totalVehicleCount = Object.values(
            this.radiogram.vehicleCount
        ).reduce((a, b) => a + b, 0);

        const simulatedRegionSelector = createSelectSimulatedRegion(
            this.radiogram.simulatedRegionId
        );
        const simulatedRegionNameSelector = createSelector(
            simulatedRegionSelector,
            (simulatedRegion) => simulatedRegion.name
        );
        this.simulatedRegionName$ = this.store.select(
            simulatedRegionNameSelector
        );
    }
}
