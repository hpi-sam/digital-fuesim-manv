import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import type { SimulatedRegion, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { StoreService } from 'src/app/core/store.service';
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
    public readonly currentRole$ = this.storeService.select$(selectCurrentRole);

    constructor(
        private readonly storeService: StoreService,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnInit() {
        this.simulatedRegion$ = this.storeService.select$(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );
    }

    public renameSimulatedRegion(newName: string) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Rename simulatedRegion',
            simulatedRegionId: this.simulatedRegionId,
            newName,
        });
    }
}
