import type { OnInit } from '@angular/core';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
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
        private readonly storeService: StoreService
    ) {}

    ngOnInit(): void {
        this.simulatedRegionIds$ = this.storeService
            .select$(selectSimulatedRegions)
            .pipe(map((simulatedRegions) => Object.keys(simulatedRegions)));
    }

    public close() {
        this.activeModal.close();
    }
}
