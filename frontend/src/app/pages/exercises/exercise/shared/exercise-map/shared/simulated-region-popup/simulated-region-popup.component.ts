import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID, SimulatedRegion } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectSimulatedRegion } from 'src/app/state/application/selectors/exercise.selectors';
import { selectCurrentRole } from 'src/app/state/application/selectors/shared.selectors';

@Component({
    selector: 'app-simulated-region-popup',
    templateUrl: './simulated-region-popup.component.html',
    styleUrls: ['./simulated-region-popup.component.scss'],
})
export class SimulatedRegionPopupComponent implements OnInit {
    // These properties are only set after OnInit
    public simulatedRegionId!: UUID;

    @Output() readonly closePopup = new EventEmitter<void>();

    public simulatedRegion$?: Observable<SimulatedRegion>;
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit() {
        this.simulatedRegion$ = this.store.select(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );
    }
}
