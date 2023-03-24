import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { VehicleCountRadiogram } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';

@Component({
    selector: 'app-radiogram-card-content-vehicle-count',
    templateUrl: './radiogram-card-content-vehicle-count.component.html',
    styleUrls: ['./radiogram-card-content-vehicle-count.component.scss'],
})
export class RadiogramCardContentVehicleCountComponent implements OnInit {
    @Input() radiogram!: VehicleCountRadiogram;
    totalVehicleCount!: number;
    simulatedRegionName$!: Observable<string>;
    vehicleCounts!: { vehicleType: string; vehicleCount: number }[];

    ngOnInit(): void {
        this.vehicleCounts = Object.entries(this.radiogram.vehicleCount).map(
            ([vehicleType, vehicleCount]) => ({ vehicleType, vehicleCount })
        );

        this.totalVehicleCount = Object.values(
            this.radiogram.vehicleCount
        ).reduce((a, b) => a + b, 0);
    }
}
