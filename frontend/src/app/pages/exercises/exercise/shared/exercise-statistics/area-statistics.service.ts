import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map, ReplaySubject } from 'rxjs';
import type { AreaStatistics } from '../core/statistics/area-statistics';
import type { StatisticsEntry } from '../core/statistics/statistics-entry';
import { StatisticsService } from '../core/statistics/statistics.service';
import { decimateStatistics } from './shared/decimate-statistics';

@Injectable({
    providedIn: 'root',
})
export class AreaStatisticsService {
    /**
     * UUID: the viewportId
     * null: the whole exercise
     */
    private areaId: UUID | null = null;
    public readonly areaId$ = new BehaviorSubject<UUID | null>(this.areaId);

    private readonly statistics$ = new ReplaySubject<
        readonly StatisticsEntry[]
    >(1);

    /**
     * Emits the statistics for the current area and the accompanying correct exerciseTime
     */
    public readonly areaStatistics$: Observable<AreaStatisticsEntry[]> =
        combineLatest([this.statistics$, this.areaId$]).pipe(
            map(([statistics, areaId]) =>
                statistics
                    .map((statisticEntry) => ({
                        value:
                            areaId === null
                                ? statisticEntry.exercise
                                : // If the viewport didn't exist yet
                                  statisticEntry.viewports[areaId],
                        exerciseTime: statisticEntry.exerciseTime,
                    }))
                    .filter((entry) => entry.value !== undefined)
            )
        );

    // TODO: This should not be necessary anymore...
    /**
     * The {@link areaStatistics$} decimated to reduce the amount of data per emit
     */
    public readonly decimatedAreaStatistics$ = this.areaStatistics$.pipe(
        map((statistics) => decimateStatistics(statistics))
    );

    constructor(private readonly statisticsService: StatisticsService) {}

    public setAreaId(areaId: UUID | null) {
        this.areaId = areaId;
        this.areaId$.next(areaId);
    }

    public async updateStatistics() {
        const statistics = await this.statisticsService.generateStatistics();
        this.statistics$.next(statistics);
    }
}

export interface AreaStatisticsEntry {
    value: AreaStatistics;
    exerciseTime: number;
}
