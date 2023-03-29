import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { VehicleCountRadiogram } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectRadiogram } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-vehicle-count',
    templateUrl: './radiogram-card-content-vehicle-count.component.html',
    styleUrls: ['./radiogram-card-content-vehicle-count.component.scss'],
})
export class RadiogramCardContentVehicleCountComponent implements OnInit {
    @Input() radiogramId!: UUID;
    radiogram$!: Observable<VehicleCountRadiogram>;
    totalVehicleCount$!: Observable<number>;
    vehicleCounts$!: Observable<
        { vehicleType: string; vehicleCount: number }[]
    >;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        const radiogramSelector = createSelectRadiogram<VehicleCountRadiogram>(
            this.radiogramId
        );

        const vehicleCountsSelector = createSelector(
            radiogramSelector,
            (radiogram) =>
                Object.entries(radiogram.vehicleCount).map(
                    ([vehicleType, vehicleCount]) => ({
                        vehicleType,
                        vehicleCount,
                    })
                )
        );

        const totalVehicleCountSelector = createSelector(
            vehicleCountsSelector,
            (vehicleCount) =>
                Object.values(vehicleCount).reduce(
                    (value, item) => value + item.vehicleCount,
                    0
                )
        );

        this.vehicleCounts$ = this.store.select(vehicleCountsSelector);
        this.radiogram$ = this.store.select(radiogramSelector);
        this.totalVehicleCount$ = this.store.select(totalVehicleCountSelector);
    }
}
