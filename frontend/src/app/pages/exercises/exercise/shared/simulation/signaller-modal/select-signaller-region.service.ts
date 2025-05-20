import type { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import { createSelectSimulatedRegion } from 'src/app/state/application/selectors/exercise.selectors';

// Constant
// eslint-disable-next-line @typescript-eslint/naming-convention
export const EOC_ID = 'emergencyOperationsCenter';

export type SignallerRegionID = UUID | typeof EOC_ID;

@Injectable()
export class SelectSignallerRegionService implements OnDestroy {
    public readonly selectedSimulatedRegion$ =
        new ReplaySubject<SignallerRegionID | null>(1);

    private readonly changeOrDestroy$ = new Subject<void>();

    constructor(private readonly store: Store<AppState>) {}

    public selectSimulatedRegion(id: SignallerRegionID) {
        this.selectedSimulatedRegion$.next(id);

        if (id !== EOC_ID) {
            this.store
                .select(createSelectSimulatedRegion(id))
                .pipe(takeUntil(this.changeOrDestroy$))
                .subscribe((simulatedRegion) => {
                    // The simulatedRegion could be undefined if the ID is invalid (e.g., the region was deleted)
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (!simulatedRegion) {
                        this.selectedSimulatedRegion$.next(null);
                    }
                });
        }
    }

    ngOnDestroy() {
        this.changeOrDestroy$.next();
    }
}
