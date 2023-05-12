import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { UUID } from 'digital-fuesim-manv-shared';
import type {
    AssignLeaderBehaviorState,
    Personnel,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectBehaviorState,
    selectPersonnel,
    selectVehicleTemplates,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-behavior-assign-leader',
    templateUrl:
        './simulated-region-overview-behavior-assign-leader.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-assign-leader.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorAssignLeaderComponent
    implements OnChanges
{
    @Input() assignLeaderBehaviorId!: UUID;
    @Input() simulatedRegionId!: UUID;

    behaviorState$!: Observable<AssignLeaderBehaviorState>;

    currentLeader$!: Observable<Personnel | undefined>;

    vehicleOfCurrentLeader$!: Observable<Vehicle | undefined>;

    vehicleTypesToAdd$!: Observable<string[]>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnChanges(): void {
        this.behaviorState$ = this.store.select(
            createSelectBehaviorState<AssignLeaderBehaviorState>(
                this.simulatedRegionId,
                this.assignLeaderBehaviorId
            )
        );

        const personnel$ = this.store.select(selectPersonnel);

        this.currentLeader$ = combineLatest([
            this.behaviorState$,
            personnel$,
        ]).pipe(
            map(([behaviorState, personnel]) =>
                behaviorState.leaderId
                    ? personnel[behaviorState.leaderId]
                    : undefined
            )
        );

        const vehicles$ = this.store.select(selectVehicles);

        this.vehicleOfCurrentLeader$ = combineLatest([
            this.currentLeader$,
            vehicles$,
        ]).pipe(
            map(([currentLeader, vehicles]) =>
                currentLeader ? vehicles[currentLeader.vehicleId] : undefined
            )
        );

        const vehicleTemplates$ = this.store.select(selectVehicleTemplates);

        this.vehicleTypesToAdd$ = combineLatest([
            this.behaviorState$,
            vehicleTemplates$,
        ]).pipe(
            map(([behaviorState, vehicleTemplates]) =>
                vehicleTemplates
                    .map((vehicleTemplate) => vehicleTemplate.vehicleType)
                    .filter(
                        (vehicleType) =>
                            !behaviorState.leadershipVehicleTypes[vehicleType]
                    )
            )
        );
    }

    addVehicleType(vehicleType: string) {
        this.exerciseService.proposeAction({
            type: '[AssignLeaderBehavior] Add Leadership Vehicle Type',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.assignLeaderBehaviorId,
            vehicleType,
        });
    }

    removeVehicleType(vehicleType: string) {
        this.exerciseService.proposeAction({
            type: '[AssignLeaderBehavior] Remove Leadership Vehicle Type',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.assignLeaderBehaviorId,
            vehicleType,
        });
    }
}
