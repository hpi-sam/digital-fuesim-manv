import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    Client,
    ExerciseState,
    Mutable,
    Patient,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import {
    applyAction,
    cloneDeepMutable,
    Personnel,
    sleep,
    uuid,
    Viewport,
} from 'digital-fuesim-manv-shared';
import { countBy } from 'lodash';
import { ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentTime } from 'src/app/state/exercise/exercise.selectors';
import { getStateSnapshot } from 'src/app/state/get-state-snapshot';
import type { AreaStatistics } from './area-statistics';
import type { StatisticsEntry } from './statistics-entry';

@Injectable({
    providedIn: 'root',
})
export class StatisticsService {
    constructor(
        private readonly apiService: ApiService,
        private readonly store: Store<AppState>
    ) {}

    public updatingStatistics = false;
    // TODO: When changing the exercise, this still emits the statistics of the previous exercise
    public readonly statistics$ = new ReplaySubject<readonly StatisticsEntry[]>(
        1
    );

    // TODO: Already calculated statistics could be cached
    // TODO: Maybe calculate this in a webworker to not block the main thread
    // a short test showed that the calculating in the webworker (excluding communication, structuredClone etc.)
    // was ca. half as fast as on the main thread
    private readonly maximumNumberOfDataPoints = 200;
    public async updateStatistics(): Promise<readonly StatisticsEntry[]> {
        this.updatingStatistics = true;
        // The statistics during timeTravel are only up onto the respective point.
        const maximumExerciseTime = selectCurrentTime(
            getStateSnapshot(this.store)
        );
        const { initialState, actionsWrappers } =
            await this.apiService.exerciseHistory();

        const minimumExerciseTime = initialState.currentTime;

        const generateStatisticsInterval = Math.max(
            (maximumExerciseTime - minimumExerciseTime) /
                this.maximumNumberOfDataPoints,
            // Generate the statistics at most every second
            1000
        );
        const statistics: StatisticsEntry[] = [];
        const statisticsState = cloneDeepMutable(initialState);
        // Apply all actions (mutable -> fast) and generate in regular intervals a statisticsEntry
        for (const [i, { action }] of actionsWrappers.entries()) {
            applyAction(statisticsState, action);
            if (
                statisticsState.currentTime >
                (statistics.at(-1)?.exerciseTime ?? 0) +
                    generateStatisticsInterval
            ) {
                statistics.push(this.generateStatisticsEntry(statisticsState));
            }
            if (i % 100 === 0) {
                // Do not block the main thread for too long
                // eslint-disable-next-line no-await-in-loop
                await sleep(0);
            }
        }
        this.statistics$.next(statistics);
        this.updatingStatistics = false;
        return statistics;
    }

    private generateStatisticsEntry(draftState: Mutable<ExerciseState>) {
        const exerciseStatistics = this.generateAreaStatistics(
            Object.values(draftState.clients),
            Object.values(draftState.patients),
            Object.values(draftState.vehicles),
            Object.values(draftState.personnel)
        );

        const viewportStatistics = Object.fromEntries(
            Object.entries(draftState.viewports).map(([id, viewport]) => [
                id,
                this.generateAreaStatistics(
                    Object.values(draftState.clients).filter(
                        (client) => client.viewRestrictedToViewportId === id
                    ),
                    Object.values(draftState.patients).filter(
                        (patient) =>
                            patient.position &&
                            Viewport.isInViewport(viewport, patient.position)
                    ),
                    Object.values(draftState.vehicles).filter(
                        (vehicle) =>
                            vehicle.position &&
                            Viewport.isInViewport(viewport, vehicle.position)
                    ),
                    Object.values(draftState.personnel).filter(
                        (personnel) =>
                            personnel.position &&
                            Viewport.isInViewport(viewport, personnel.position)
                    )
                ),
            ])
        );
        return {
            id: uuid(),
            exercise: exerciseStatistics,
            viewports: viewportStatistics,
            exerciseTime: draftState.currentTime,
        };
    }

    private generateAreaStatistics(
        clients: Client[],
        patients: Patient[],
        vehicles: Vehicle[],
        personnel: Personnel[]
    ): AreaStatistics {
        return {
            numberOfActiveParticipants: clients.filter(
                (client) =>
                    !client.isInWaitingRoom && client.role === 'participant'
            ).length,
            patients: countBy(patients, (patient) => patient.realStatus),
            vehicles: countBy(vehicles, (vehicle) => vehicle.vehicleType),
            personnel: countBy(
                personnel.filter(
                    (_personnel) =>
                        !Personnel.isInVehicle(_personnel) &&
                        _personnel.transfer === undefined
                ),
                (_personnel) => _personnel.personnelType
            ),
        };
    }
}
