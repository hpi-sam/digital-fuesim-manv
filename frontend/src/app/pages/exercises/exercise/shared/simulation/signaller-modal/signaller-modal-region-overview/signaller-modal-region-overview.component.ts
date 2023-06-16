import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectSimulatedRegion } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-signaller-modal-region-overview',
    templateUrl: './signaller-modal-region-overview.component.html',
    styleUrls: ['./signaller-modal-region-overview.component.scss'],
})
export class SignallerModalRegionOverviewComponent implements OnInit {
    @Input() simulatedRegionId!: UUID;

    simulatedRegion$!: Observable<SimulatedRegion>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit() {
        this.simulatedRegion$ = this.store.select(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );
    }
}
