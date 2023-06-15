import { Injectable } from '@angular/core';
import type { UUID } from 'digital-fuesim-manv-shared';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class SelectSignallerRegionService {
    public readonly selectedSimulatedRegion$ = new ReplaySubject<UUID>(1);

    public selectSimulatedRegion(id: UUID) {
        this.selectedSimulatedRegion$.next(id);
    }
}
