import { OnInit, ViewEncapsulation } from '@angular/core';
import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { createSelector, Store } from '@ngrx/store';
import type { SimulatedRegion, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { selectSimulatedRegions } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-regions-modal',
    templateUrl: './simulated-regions-modal.component.html',
    styleUrls: ['./simulated-regions-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimulatedRegionsModalComponent implements OnInit {
    simulatedRegionIds!: Observable<
        {
            name: string;
            id: UUID;
            simulatedRegion: SimulatedRegion;
        }[]
    >;

    @Input()
    currentSimulatedRegionId!: string;

    constructor(
        public readonly activeModal: NgbActiveModal,
        public readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        this.simulatedRegionIds = this.store.select(
            createSelector(selectSimulatedRegions, (simulatedRegions) =>
                Object.values(simulatedRegions).map((simulatedRegion) => ({
                    name: simulatedRegion.name,
                    id: simulatedRegion.id,
                    simulatedRegion,
                }))
            )
        );
    }

    public close() {
        this.activeModal.close();
    }
}
