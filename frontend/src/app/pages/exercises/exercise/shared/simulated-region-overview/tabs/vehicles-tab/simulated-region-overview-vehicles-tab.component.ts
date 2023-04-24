import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    UUID,
    Vehicle,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { groupBy } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest, map, Subject } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectElementsInSimulatedRegion,
    selectVehicleTemplates,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-vehicles-tab',
    templateUrl: './simulated-region-overview-vehicles-tab.component.html',
    styleUrls: ['./simulated-region-overview-vehicles-tab.component.scss'],
})
export class SimulatedRegionOverviewVehiclesTabComponent implements OnInit {
    @Input()
    simulatedRegion!: SimulatedRegion;

    selectedVehicleId$ = new Subject<UUID | null>();
    selectedVehicle$!: Observable<Vehicle | undefined>;

    groupedVehicles$!: Observable<
        { vehicleType: string; vehicles: Vehicle[] }[]
    >;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        const vehicles$ = this.store.select(
            createSelectElementsInSimulatedRegion(
                selectVehicles,
                this.simulatedRegion.id
            )
        );

        const vehicleTemplates$ = this.store.select(selectVehicleTemplates);

        this.groupedVehicles$ = combineLatest([
            vehicles$,
            vehicleTemplates$,
        ]).pipe(
            map(([vehicles, vehicleTemplates]) => {
                const groupedVehicles = groupBy(
                    vehicles,
                    (vehicle) => vehicle.vehicleType
                );

                return Object.entries(groupedVehicles)
                    .sort(
                        ([keyA], [keyB]) =>
                            this.indexOfTemplate(vehicleTemplates, keyA) -
                            this.indexOfTemplate(vehicleTemplates, keyB)
                    )
                    .map(([key, values]) => ({
                        vehicleType: key,
                        vehicles: values.sort((a, b) =>
                            a.name.localeCompare(b.name)
                        ),
                    }));
            })
        );

        this.selectedVehicle$ = combineLatest([
            vehicles$,
            this.selectedVehicleId$,
        ]).pipe(
            map(([vehicles, selectedId]) =>
                vehicles.find((vehicle) => vehicle.id === selectedId)
            )
        );
    }

    selectVehicle(vehicleId: UUID) {
        this.selectedVehicleId$.next(vehicleId);
    }

    private indexOfTemplate(
        vehicleTemplates: readonly VehicleTemplate[],
        vehicleType: string
    ): number {
        const index = vehicleTemplates.findIndex(
            (template) => template.vehicleType === vehicleType
        );
        return index === -1 ? vehicleTemplates.length : index;
    }
}
