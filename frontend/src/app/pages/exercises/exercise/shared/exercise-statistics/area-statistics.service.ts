import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { BehaviorSubject, switchMap } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';

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
     * Emits the statistics for the current area
     */
    public areaStatistics$ = this.areaId$.pipe(
        switchMap((areaId) =>
            this.store.select((state) =>
                state.exercise.statistics.map((statisticEntry) =>
                    areaId === null
                        ? statisticEntry.exercise
                        : statisticEntry.viewports[areaId]
                )
            )
        )
    );

    public setAreaId(areaId: UUID | null) {
        this.areaId = areaId;
        this.areaId$.next(areaId);
    }

    constructor(private readonly store: Store<AppState>) {}
}
