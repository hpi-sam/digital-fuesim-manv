import type { OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { MemoizedSelector } from '@ngrx/store';
import { Store, createSelector } from '@ngrx/store';
import type { TransferBehaviorState } from 'digital-fuesim-manv-shared';
import { UUID } from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityStatesByType,
    createSelectBehaviorState,
    selectHospitals,
    selectTransferPoints,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';

let globalLastInformationCollapsed = true;
let globalLastSettingsCollapsed = true;

@Component({
    selector: 'app-simulated-region-overview-behavior-transfer-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-transfer-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-transfer-vehicles.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTransferVehiclesComponent
    implements OnInit
{
    @Input() simulatedRegionId!: UUID;
    @Input() transferBehaviorId!: UUID;

    public bufferedTransfers$!: Observable<
        { vehicleName: string; destination: string; numberOfPatients: number }[]
    >;
    public activeActivities$!: Observable<
        { vehicleName: string; destination: string; numberOfPatients: number }[]
    >;
    private _informationCollapsed: boolean;
    transferBehaviorState$!: Observable<TransferBehaviorState>;

    public get informationCollapsed(): boolean {
        return this._informationCollapsed;
    }
    public set informationCollapsed(value: boolean) {
        this._informationCollapsed = value;
        globalLastInformationCollapsed = value;
    }

    private _settingsCollapsed: boolean;

    public get settingsCollapsed(): boolean {
        return this._settingsCollapsed;
    }
    public set settingsCollapsed(value: boolean) {
        this._settingsCollapsed = value;
        globalLastSettingsCollapsed = value;
    }

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {
        this._informationCollapsed = globalLastInformationCollapsed;
        this._settingsCollapsed = globalLastSettingsCollapsed;
    }

    ngOnInit(): void {
        const transferBehaviorStateSelector: MemoizedSelector<
            AppState,
            TransferBehaviorState
        > = createSelectBehaviorState(
            this.simulatedRegionId,
            this.transferBehaviorId
        );

        const bufferedTransferEventQueueSelector = createSelector(
            transferBehaviorStateSelector,
            (transferBehaviorState) =>
                transferBehaviorState.startTransferEventQueue
        );

        const bufferedTransfersSelector = createSelector(
            bufferedTransferEventQueueSelector,
            selectVehicles,
            selectHospitals,
            selectTransferPoints,
            (bufferedTransferEventQueue, vehicles, hospitals, transferPoints) =>
                bufferedTransferEventQueue.map((bufferedTransferEvent) => ({
                    vehicleName:
                        vehicles[bufferedTransferEvent.vehicleId]?.name ??
                        'Gelöschtes Fahrzeug',
                    destination: hospitals[
                        bufferedTransferEvent.transferDestinationId
                    ]
                        ? hospitals[
                              bufferedTransferEvent.transferDestinationId
                          ]!.name
                        : transferPoints[
                              bufferedTransferEvent.transferDestinationId
                          ]
                        ? transferPoints[
                              bufferedTransferEvent.transferDestinationId
                          ]!.externalName
                        : 'Gelöschtes Ziel',
                    numberOfPatients: Object.keys(
                        vehicles[bufferedTransferEvent.vehicleId]?.patientIds ??
                            {}
                    ).length,
                }))
        );

        const activeActivityStatesSelector = createSelectActivityStatesByType(
            this.simulatedRegionId,
            'loadVehicleActivity'
        );

        const activeActivitiesSelector = createSelector(
            activeActivityStatesSelector,
            selectVehicles,
            selectHospitals,
            selectTransferPoints,
            (activeActivityStates, vehicles, hospitals, transferPoints) =>
                activeActivityStates.map((activeActivityState) => ({
                    vehicleName:
                        vehicles[activeActivityState.vehicleId]?.name ??
                        'Gelöschtes Fahrzeug',
                    destination: hospitals[
                        activeActivityState.transferDestinationId
                    ]
                        ? hospitals[activeActivityState.transferDestinationId]!
                              .name
                        : transferPoints[
                              activeActivityState.transferDestinationId
                          ]
                        ? transferPoints[
                              activeActivityState.transferDestinationId
                          ]!.externalName
                        : 'Gelöschtes Ziel',
                    numberOfPatients: Object.keys(
                        activeActivityState.patientsToBeLoaded
                    ).length,
                }))
        );

        this.bufferedTransfers$ = this.store.select(bufferedTransfersSelector);
        this.activeActivities$ = this.store.select(activeActivitiesSelector);
        this.transferBehaviorState$ = this.store.select(
            transferBehaviorStateSelector
        );
    }

    public updatePatientLoadTime(loadTimePerPatient: number) {
        this.exerciseService.proposeAction({
            type: '[TransferBehavior] Update Patient Load Time',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transferBehaviorId,
            loadTimePerPatient,
        });
    }
    public updatePersonnelLoadTime(personnelLoadTime: number) {
        this.exerciseService.proposeAction({
            type: '[TransferBehavior] Update Personnel Load Time',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transferBehaviorId,
            personnelLoadTime,
        });
    }
    public updateSendDelay(delayBetweenSends: number) {
        this.exerciseService.proposeAction({
            type: '[TransferBehavior] Update Delay Between Sends',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transferBehaviorId,
            delayBetweenSends,
        });
    }
}
