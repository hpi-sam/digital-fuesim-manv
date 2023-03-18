import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import type { SimulatedRegion } from 'digital-fuesim-manv-shared';
import { isInSpecificSimulatedRegion, UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { map, Subject, takeUntil } from 'rxjs';
import { StoreService } from 'src/app/core/store.service';
import {
    createSelectSimulatedRegion,
    selectTransferPoints,
} from 'src/app/state/application/selectors/exercise.selectors';
import { SelectPatientService } from '../select-patient.service';

type NavIds =
    | 'behaviors'
    | 'general'
    | 'hospitalTransfer'
    | 'patients'
    | 'transferPoint';

/**
 * We want to remember the last selected nav item, so the user doesn't have to manually select it again.
 */
let activeNavId: NavIds = 'general';

@Component({
    selector: 'app-simulated-region-overview-general',
    templateUrl: './simulated-region-overview.component.html',
    styleUrls: ['./simulated-region-overview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class SimulatedRegionOverviewGeneralComponent
    implements OnInit, OnDestroy
{
    @Input() simulatedRegionId!: UUID;

    simulatedRegion$!: Observable<SimulatedRegion>;

    selectedPatientId!: UUID;

    public transferPointId$!: Observable<UUID>;

    public get activeNavId() {
        return activeNavId;
    }
    public set activeNavId(value: NavIds) {
        activeNavId = value;
    }

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly storeService: StoreService,
        readonly selectPatientService: SelectPatientService
    ) {}

    ngOnInit(): void {
        this.simulatedRegion$ = this.storeService.select$(
            createSelectSimulatedRegion(this.simulatedRegionId)
        );
        this.transferPointId$ = this.storeService
            .select$(selectTransferPoints)
            .pipe(
                map(
                    (transferPoints) =>
                        Object.values(transferPoints).find((transferPoint) =>
                            isInSpecificSimulatedRegion(
                                transferPoint,
                                this.simulatedRegionId
                            )
                        )!.id
                )
            );

        this.selectPatientService.patientSelected
            .pipe(takeUntil(this.destroy$))
            .subscribe((newId) => {
                this.selectedPatientId = newId;
                this.activeNavId = 'patients';
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
    }
}
