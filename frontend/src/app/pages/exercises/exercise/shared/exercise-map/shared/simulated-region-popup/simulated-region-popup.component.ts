import type { OnInit } from '@angular/core';
import { Component, EventEmitter, Output } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    UUID,
    Vehicle,
    Personnel,
    Material,
    Patient,
    WithPosition,
} from 'digital-fuesim-manv-shared';
import {
    SimulatedRegion,
    UnloadArrivedVehiclesBehaviorState,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectSimulatedRegion,
    selectVehicles,
    selectMaterials,
    selectPatients,
    selectPersonnel,
} from 'src/app/state/application/selectors/exercise.selectors';
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
    public vehicles$?: Observable<Vehicle[]>;
    public personnel$?: Observable<Personnel[]>;
    public materials$?: Observable<Material[]>;
    public patients$?: Observable<Patient[]>;
    public readonly currentRole$ = this.store.select(selectCurrentRole);

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    createSelectContainedElements<E extends WithPosition>(
        elementsSelector: (state: AppState) => { [key: UUID]: E }
    ) {
        return createSelector(
            createSelectSimulatedRegion(this.simulatedRegionId),
            elementsSelector,
            (simulatedRegion, elements) =>
                Object.values(elements).filter((e) =>
                    SimulatedRegion.isInSimulatedRegion(simulatedRegion, e)
                )
        );
    }

    ngOnInit() {
        this.simulatedRegion$ = this.store.select(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );

        // TODO: These are for debugging only and ought to be removed or refactored
        this.vehicles$ = this.store.select(
            this.createSelectContainedElements(selectVehicles)
        );
        this.materials$ = this.store.select(
            this.createSelectContainedElements(selectMaterials)
        );
        this.personnel$ = this.store.select(
            this.createSelectContainedElements(selectPersonnel)
        );
        this.patients$ = this.store.select(
            this.createSelectContainedElements(selectPatients)
        );
    }

    public renameSimulatedRegion(newName: string) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Rename simulatedRegion',
            simulatedRegionId: this.simulatedRegionId,
            newName,
        });
    }

    public addUnloadArrivedVehicleBehavior(event: any) {
        this.exerciseService.proposeAction({
            type: '[SimulatedRegion] Add Behavior',
            simulatedRegionId: this.simulatedRegionId,
            behaviorState: UnloadArrivedVehiclesBehaviorState.create(5000),
        });
    }
}
