import type { OnInit } from '@angular/core';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { selectSimulatedRegions } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-regions-modal',
    templateUrl: './simulated-regions-modal.component.html',
    styleUrls: ['./simulated-regions-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimulatedRegionsModalComponent implements OnInit {
    simulatedRegionIds$!: Observable<UUID[]>;

    @Input()
    currentSimulatedRegionId!: string;

    constructor(
        public readonly activeModal: NgbActiveModal,
        public readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        this.simulatedRegionIds$ = this.store
            .select(selectSimulatedRegions)
            .pipe(
                map((simulatedRegions) => Object.keys(simulatedRegions)),
                distinctUntilChanged((previous, current) => {
                    if (previous.length !== current.length) return false;

                    return previous.every(
                        (element, index) => element === current[index]
                    );
                })
            );
    }

    public close() {
        this.activeModal.close();
    }
}
