import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type {
    UnloadArrivingVehiclesBehaviorState,
    UnloadVehicleActivityState,
} from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectSimulatedRegion,
    selectExerciseState,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-simulated-region-overview-behavior-unload-arriving-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-unload-arriving-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-unload-arriving-vehicles.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorUnloadArrivingVehiclesComponent
    implements OnInit
{
    @Input()
    simulatedRegionId!: UUID;

    @Input()
    behaviorId!: UUID;

    unloadDuration$?: Observable<number>;
    vehiclesStatus$?: Observable<VehicleUnloadStatus[]>;

    constructor(
        private readonly exerciseService: ExerciseService,
        public readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        const simulatedRegionSelector = createSelectSimulatedRegion(
            this.simulatedRegionId
        );
        const behaviorStateSelector = createSelector(
            simulatedRegionSelector,
            (simulatedRegion) =>
                simulatedRegion?.behaviors.find(
                    (behavior) => behavior.id === this.behaviorId
                ) as UnloadArrivingVehiclesBehaviorState | undefined
        );
        this.unloadDuration$ = this.store.select(
            createSelector(
                behaviorStateSelector,
                (behavior) => behavior?.unloadDelay ?? 0
            )
        );

        const activityStateSelector = createSelector(
            simulatedRegionSelector,
            (simulatedRegion) =>
                Object.values(simulatedRegion.activities).filter(
                    (activity): activity is UnloadVehicleActivityState =>
                        activity.type === 'unloadVehicleActivity'
                )
        );

        const unloadingSelector = createSelector(
            activityStateSelector,
            selectVehicles,
            (activities, vehicles) =>
                activities.map((activity) => ({
                    vehicle: vehicles[activity.vehicleId]!,
                    endTime: activity.startTime + activity.duration,
                }))
        );

        const currentTimeSelector = createSelector(
            selectExerciseState,
            (state) => state.currentTime
        );

        this.vehiclesStatus$ = this.store.select(
            createSelector(
                currentTimeSelector,
                unloadingSelector,
                (now, unloads) =>
                    unloads.map(
                        (unload): VehicleUnloadStatus => ({
                            timeLeft: unload.endTime - now,
                            vehicleName: unload.vehicle.name,
                            vehicleId: unload.vehicle.id,
                        })
                    )
            )
        );
    }

    updateUnloadTime(duration: number) {
        this.exerciseService.proposeAction({
            type: '[UnloadArrivingVehiclesBehavior] Update UnloadDelay',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            unloadDelay: duration,
        });
    }
}

interface VehicleUnloadStatus {
    timeLeft: number;
    vehicleName: string;
    vehicleId: UUID;
}
