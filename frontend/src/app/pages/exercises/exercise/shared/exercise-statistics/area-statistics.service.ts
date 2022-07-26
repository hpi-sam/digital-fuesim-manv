import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import type { AreaStatistics } from '../core/statistics/area-statistics';
import { StatisticsService } from '../core/statistics/statistics.service';

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

    /**
     * Emits the statistics for the current area and the accompanying correct exerciseTime
     */
    public readonly areaStatistics$: Observable<AreaStatisticsEntry[]> =
        combineLatest([this.statisticsService.statistics$, this.areaId$]).pipe(
            map(
                ([statistics, areaId]) =>
                    statistics
                        .map((statisticEntry) => ({
                            value:
                                areaId === null
                                    ? statisticEntry.exercise
                                    : // This is filtered out in the next step, if the viewport didn't exist yet
                                      statisticEntry.viewports[areaId],
                            exerciseTime: statisticEntry.exerciseTime,
                        }))
                        .filter(
                            (entry) => entry.value !== undefined
                        ) as AreaStatisticsEntry[]
            )
        );

    constructor(private readonly statisticsService: StatisticsService) {}

    public setAreaId(areaId: UUID | null) {
        this.areaId = areaId;
        this.areaId$.next(areaId);
    }
}

export interface AreaStatisticsEntry {
    value: AreaStatistics;
    exerciseTime: number;
}
