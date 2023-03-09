import type { OnInit } from '@angular/core';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { UUID, isInSpecificSimulatedRegion } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    selectTransferPoints,
    createSelectSimulatedRegion,
} from 'src/app/state/application/selectors/exercise.selectors';

type NavIds = 'behaviors' | 'general' | 'transfer';
/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: NavIds = 'general';

@Component({
    selector: 'app-simulated-region-overview-general',
    templateUrl: './simulated-region-overview.component.html',
    styleUrls: ['./simulated-region-overview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimulatedRegionOverviewGeneralComponent implements OnInit {
    @Input() simulatedRegionId!: UUID;

    simulatedRegion$!: Observable<SimulatedRegion>;

    public transferPointId$!: Observable<UUID>;

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: NavIds) {
        activeNavId = value;
    }

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        this.simulatedRegion$ = this.store.select(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );
        this.transferPointId$ = this.store.select(
            createSelector(
                selectTransferPoints,
                (transferPoints) =>
                    Object.values(transferPoints).find((transferPoint) =>
                        isInSpecificSimulatedRegion(
                            transferPoint,
                            this.simulatedRegionId
                        )
                    )!.id
            )
        );
    }
}
