import { Injectable } from '@angular/core';
import type {
    Client,
    ExerciseState,
    Mutable,
    Patient,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import {
    applyAction,
    Personnel,
    uuid,
    Viewport,
} from 'digital-fuesim-manv-shared';
import produce from 'immer';
import { countBy } from 'lodash';
import { ApiService } from 'src/app/core/api.service';
import type { AreaStatistics } from './area-statistics';
import type { StatisticsEntry } from './statistics-entry';

@Injectable({
    providedIn: 'root',
})
export class StatisticsService {
    constructor(private readonly apiService: ApiService) {}

    private readonly maximumNumberOfDataPoints = 200;
    public async generateStatistics(): Promise<readonly StatisticsEntry[]> {
        const { initialState, actionsWrappers } =
            await this.apiService.exerciseHistory();
        const actions = actionsWrappers.map((wrapper) => wrapper.action);
        const statistics: StatisticsEntry[] = [];
        produce(initialState, (draftState) => {
            for (const action of actions) {
                applyAction(draftState, action);
                // TODO: make it so that only 200 equidistant data points are generated
                if (
                    draftState.currentTime >
                    (statistics.at(-1)?.exerciseTime ?? 0) + 10000
                ) {
                    statistics.push(this.generateStatisticsEntry(draftState));
                }
            }
        });
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
