import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { VehicleTemplate } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectVehicleTemplate } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-vehicle-template-display',
    templateUrl: './vehicle-template-display.component.html',
    styleUrls: ['./vehicle-template-display.component.scss'],
})
export class VehicleTemplateDisplayComponent implements OnChanges {
    @Input() vehicleTemplateId!: UUID;

    public vehicleTemplate$?: Observable<VehicleTemplate>;

    ngOnChanges() {
        this.vehicleTemplate$ = this.storeService.select$(
            createSelectVehicleTemplate(this.vehicleTemplateId)
        );
    }

    constructor(private readonly storeService: StoreService) {}
}
