import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store, createSelector } from '@ngrx/store';
import type {
    NewPatientDataRequestedRadiogram,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectRadiogram,
    selectSimulatedRegions,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector: 'app-radiogram-card-content-transport-patient-count-request',
    templateUrl:
        './radiogram-card-content-transport-patient-count-request.component.html',
    styleUrls: [
        './radiogram-card-content-transport-patient-count-request.component.scss',
    ],
})
export class RadiogramCardContentTransportPatientCountRequestComponent
    implements OnInit
{
    @Input() radiogramId!: UUID;

    radiogram$!: Observable<NewPatientDataRequestedRadiogram>;
    region$!: Observable<SimulatedRegion | undefined>;

    constructor(private readonly store: Store<AppState>) {}

    ngOnInit(): void {
        const selectRadiogram =
            createSelectRadiogram<NewPatientDataRequestedRadiogram>(
                this.radiogramId
            );
        this.radiogram$ = this.store.select(selectRadiogram);
        this.region$ = this.store.select(
            createSelector(
                selectRadiogram,
                selectSimulatedRegions,
                (radiogram, regions) => regions[radiogram.simulatedRegionId]
            )
        );
    }
}
