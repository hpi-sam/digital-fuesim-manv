import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import { createSelectSimulatedRegion } from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-name',
    templateUrl: './simulated-region-name.component.html',
    styleUrls: ['./simulated-region-name.component.scss'],
})
export class SimulatedRegionNameComponent implements OnInit {
    @Input() simulatedRegionId!: UUID;

    name$!: Observable<string>;

    constructor(private readonly storeService: StoreService) {}

    ngOnInit(): void {
        this.name$ = this.storeService
            .select$(createSelectSimulatedRegion(this.simulatedRegionId))
            .pipe(map((simulatedRegion) => simulatedRegion.name));
    }
}
