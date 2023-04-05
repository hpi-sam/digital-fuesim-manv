import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    DelayEventActivityState,
    RequestBehaviorState,
    isWaitingForAnswer,
    isWaitingForTimeout,
} from 'digital-fuesim-manv-shared';
import {
    UUID,
    SimulatedRegionRequestTargetConfiguration,
    TraineesRequestTargetConfiguration,
} from 'digital-fuesim-manv-shared';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { createSelectActivityStates } from 'src/app/state/application/selectors/exercise.selectors';
import {
    createSelectBehaviorState,
    selectSimulatedRegions,
    selectCurrentTime,
} from 'src/app/state/application/selectors/exercise.selectors';

type RequestTargetOption = UUID | 'trainees';

@Component({
    selector: 'app-simulated-region-overview-behavior-request-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-request-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-request-vehicles.component.scss',
    ],
})
export class RequestVehiclesComponent implements OnChanges {
    @Input() simulatedRegionId!: UUID;
    @Input() requestBehaviorId!: UUID;

    requestBehaviorState$!: Observable<RequestBehaviorState>;

    requestTargetOptions$!: Observable<{
        [key in RequestTargetOption]: string;
    }>;

    waitingForAnswer$!: Observable<boolean>;

    nextTimeoutIn$!: Observable<number>;

    initialRequestTargetOption$!: Observable<RequestTargetOption>;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    ngOnChanges(): void {
        this.requestTargetOptions$ = this.store
            .select(selectSimulatedRegions)
            .pipe(
                map((simulatedRegions) => {
                    const options = Object.entries(simulatedRegions)
                        .map(([id, simulatedRegion]) => [
                            id,
                            simulatedRegion.name,
                        ])
                        .filter(([id, _name]) => id !== this.simulatedRegionId)
                        .sort(([id1, name1], [id2, name2]) =>
                            name1 === name2 ? 0 : name1! < name2! ? -1 : 1
                        );
                    options.unshift(['trainees', 'Die Trainierenden']);
                    return Object.fromEntries(options);
                })
            );

        this.requestBehaviorState$ = this.store.select(
            createSelectBehaviorState(
                this.simulatedRegionId,
                this.requestBehaviorId
            )
        );

        this.initialRequestTargetOption$ = this.requestBehaviorState$.pipe(
            map((requestBehaviorState) => {
                if (
                    requestBehaviorState.requestTarget.type ===
                    'traineesRequestTarget'
                ) {
                    return 'trainees';
                }
                return requestBehaviorState.requestTarget
                    .targetSimulatedRegionId;
            })
        );

        this.waitingForAnswer$ = this.requestBehaviorState$.pipe(
            map((requestBehaviorState) =>
                isWaitingForAnswer(requestBehaviorState)
            )
        );

        const activities$ = this.store.select(
            createSelectActivityStates(this.simulatedRegionId)
        );

        const currentTime$ = this.store.select(selectCurrentTime);

        this.nextTimeoutIn$ = combineLatest([
            this.requestBehaviorState$,
            activities$,
            currentTime$
        ]).pipe(
            map(([requestBehaviorState, activities, currentTime]) => {
                if (!requestBehaviorState.delayEventActivityId) return -1;
                const delayEventActivityState = activities[
                    requestBehaviorState.delayEventActivityId
                ] as DelayEventActivityState;
                if (!delayEventActivityState) return 0;
                console.log(`delayEventActivityState.endTime: ${delayEventActivityState.endTime}`);
                console.log(`currentTime: ${currentTime}`);
                console.log(`delayEventActivityState.endTime - currentTime: ${delayEventActivityState.endTime - currentTime}`);

                return Math.max(delayEventActivityState.endTime - currentTime, 0);
            })
        );
    }

    updateRequestInterval(interval: number) {
        this.exerciseService.proposeAction({
            type: '[RequestBehavior] Update RequestInterval',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.requestBehaviorId,
            requestInterval: interval,
        });
    }

    updatePromiseInterval(interval: number) {
        this.exerciseService.proposeAction({
            type: '[RequestBehavior] Update Promise invalidation interval',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.requestBehaviorId,
            promiseInvalidationInterval: interval,
        });
    }

    updateRequestTarget(requestTarget: RequestTargetOption) {
        let requestTargetConfiguration;
        if (requestTarget === 'trainees') {
            requestTargetConfiguration =
                TraineesRequestTargetConfiguration.create();
        } else {
            requestTargetConfiguration =
                SimulatedRegionRequestTargetConfiguration.create(requestTarget);
        }
        this.exerciseService.proposeAction({
            type: '[RequestBehavior] Update RequestTarget',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.requestBehaviorId,
            requestTarget: requestTargetConfiguration,
        });
    }
}
