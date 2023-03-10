import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import type { UnloadArrivingVehiclesBehaviorState } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityStatesByType,
    createSelectBehaviorState,
    selectCurrentTime,
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
        this.unloadDuration$ = this.store
            .select(
                createSelectBehaviorState<UnloadArrivingVehiclesBehaviorState>(
                    this.simulatedRegionId,
                    this.behaviorId
                )
            )
            .pipe(map((state) => state?.unloadDelay ?? 0));

        const unloadingSelector = createSelector(
            createSelectActivityStatesByType(
                this.simulatedRegionId,
                'unloadVehicleActivity'
            ),
            selectVehicles,
            (activities, vehicles) =>
                activities.map((activity) => ({
                    vehicle: vehicles[activity.vehicleId]!,
                    endTime: activity.startTime + activity.duration,
                }))
        );

        this.vehiclesStatus$ = this.store.select(
            createSelector(
                selectCurrentTime,
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
