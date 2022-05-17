import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { VehicleTemplate } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { getSelectVehicleTemplate } from 'src/app/state/exercise/exercise.selectors';

@Component({
    selector: 'app-vehicle-template-display',
    templateUrl: './vehicle-template-display.component.html',
    styleUrls: ['./vehicle-template-display.component.scss'],
})
export class VehicleTemplateDisplayComponent implements OnChanges {
    @Input() vehicleTemplateId!: UUID;

    public vehicleTemplate$?: Observable<VehicleTemplate>;

    ngOnChanges() {
        this.vehicleTemplate$ = this.store.select(
            getSelectVehicleTemplate(this.vehicleTemplateId)
        );
    }

    constructor(private readonly store: Store<AppState>) {}
}
