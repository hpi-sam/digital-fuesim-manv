import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
    isNotInVehicle,
    currentCoordinatesOf,
    isOnMap,
    loopTroughTime,
    uuid,
    Viewport,
    isNotInTransfer,
} from 'digital-fuesim-manv-shared';
import type {
    Personnel,
    Client,
    ExerciseState,
    Patient,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import { countBy } from 'lodash-es';
import { ReplaySubject } from 'rxjs';
import { ApiService } from 'src/app/core/api.service';
import type { AppState } from 'src/app/state/app.state';
import { selectCurrentTime } from 'src/app/state/application/selectors/exercise.selectors';
import { selectStateSnapshot } from 'src/app/state/get-state-snapshot';
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
        const maximumExerciseTime = selectStateSnapshot(
            selectCurrentTime,
            this.store
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
        // Apply all actions (mutable -> fast) and generate in regular intervals a statisticsEntry
        await loopTroughTime(
            initialState,
            actionsWrappers.map(({ action }) => action),
            (stateAtTime) => {
                // Add the statisticsEntry in the last second that should be included
                if (stateAtTime.currentTime >= maximumExerciseTime) {
                    statistics.push(this.generateStatisticsEntry(stateAtTime));
                    return true;
                }
                const previousStatisticsEntry = statistics.at(-1);
                if (
                    // Add the statisticsEntry in the first second
                    !previousStatisticsEntry ||
                    // Add the statisticsEntries every generateStatisticsInterval
                    stateAtTime.currentTime >=
                        previousStatisticsEntry.exerciseTime +
                            generateStatisticsInterval
                ) {
                    statistics.push(this.generateStatisticsEntry(stateAtTime));
                }
                return false;
            }
        );
        this.statistics$.next(statistics);
        this.updatingStatistics = false;
        return statistics;
    }

    private generateStatisticsEntry(
        draftState: ExerciseState
    ): StatisticsEntry {
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
                            isOnMap(patient) &&
                            Viewport.isInViewport(
                                viewport,
                                currentCoordinatesOf(patient)
                            )
                    ),
                    Object.values(draftState.vehicles).filter(
                        (vehicle) =>
                            isOnMap(vehicle) &&
                            Viewport.isInViewport(
                                viewport,
                                currentCoordinatesOf(vehicle)
                            )
                    ),
                    Object.values(draftState.personnel).filter(
                        (personnel) =>
                            isOnMap(personnel) &&
                            Viewport.isInViewport(
                                viewport,
                                currentCoordinatesOf(personnel)
                            )
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
                        isNotInVehicle(_personnel) &&
                        isNotInTransfer(_personnel)
                ),
                (_personnel) => _personnel.personnelType
            ),
        };
    }
}
