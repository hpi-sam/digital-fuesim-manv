import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Input } from '@angular/core';
import type { MemoizedSelector } from '@ngrx/store';
import { Store, createSelector } from '@ngrx/store';
import type {
    Hospital,
    PatientStatus,
    TransferBehaviorState,
    TransferPoint,
    UUIDSet,
    Vehicle,
} from 'digital-fuesim-manv-shared';
import {
    isInSpecificSimulatedRegion,
    Patient,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { Subject, takeUntil } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import {
    createSelectActivityStatesByType,
    createSelectBehaviorState,
    createSelectElementsInSimulatedRegion,
    selectConfiguration,
    selectHospitals,
    selectPatients,
    selectTransferPoints,
    selectVehicles,
} from 'src/app/state/application/selectors/exercise.selectors';
import { comparePatientsByVisibleStatus } from '../../../compare-patients';

let globalLastInformationCollapsed = true;
let globalLastSettingsCollapsed = true;
let globalLastTransferCollapsed = true;

@Component({
    selector: 'app-simulated-region-overview-behavior-transfer-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-transfer-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-transfer-vehicles.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorTransferVehiclesComponent
    implements OnInit, OnDestroy
{
    @Input() simulatedRegionId!: UUID;
    @Input() transferBehaviorId!: UUID;

    private readonly destroy$ = new Subject<void>();
    public minPatients = 0;

    public clickedPatients: { [key: UUID]: boolean } = {};

    public bufferedTransfers$!: Observable<
        { vehicleName: string; destination: string; numberOfPatients: number }[]
    >;
    public activeActivities$!: Observable<
        { vehicleName: string; destination: string; numberOfPatients: number }[]
    >;

    public vehicleToSend?: Vehicle;

    public useableVehicles$!: Observable<Vehicle[]>;

    public reachableTransferPoints$!: Observable<TransferPoint[]>;
    public reachableHospitals$!: Observable<Hospital[]>;

    public selectedDestination?: any;

    private _informationCollapsed: boolean;
    transferBehaviorState$!: Observable<TransferBehaviorState>;
    patients$!: Observable<
        (Patient & {
            visibleStatus: PatientStatus;
        })[]
    >;

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

    private _transferCollapsed: boolean;

    public get transferCollapsed(): boolean {
        return this._transferCollapsed;
    }
    public set transferCollapsed(value: boolean) {
        this._transferCollapsed = value;
        globalLastTransferCollapsed = value;
    }

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {
        this._informationCollapsed = globalLastInformationCollapsed;
        this._settingsCollapsed = globalLastSettingsCollapsed;
        this._transferCollapsed = globalLastTransferCollapsed;
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

        const ownTransferPointSelector = createSelector(
            selectTransferPoints,
            (transferPoints) =>
                Object.values(transferPoints).find((transferPoint) =>
                    isInSpecificSimulatedRegion(
                        transferPoint,
                        this.simulatedRegionId
                    )
                )!
        );

        const vehiclesInSimulatedRegionSelector =
            createSelectElementsInSimulatedRegion(
                selectVehicles,
                this.simulatedRegionId
            );

        const patientsInSimulatedRegionSelector =
            createSelectElementsInSimulatedRegion(
                selectPatients,
                this.simulatedRegionId
            );

        const reachableTransferPointsSelector = createSelector(
            selectTransferPoints,
            ownTransferPointSelector,
            (transferPoints, transferPoint) =>
                Object.keys(transferPoint.reachableTransferPoints).map(
                    (id) => transferPoints[id]!
                )
        );

        const reachableHospitalsSelector = createSelector(
            selectHospitals,
            ownTransferPointSelector,
            (hospitals, transferPoint) =>
                Object.keys(transferPoint.reachableHospitals).map(
                    (id) => hospitals[id]!
                )
        );

        this.patients$ = this.store.select(
            createSelector(
                patientsInSimulatedRegionSelector,
                selectConfiguration,
                (patients, configuration) =>
                    patients
                        .sort((patientA, patientB) =>
                            comparePatientsByVisibleStatus(
                                patientA,
                                patientB,
                                configuration
                            )
                        )
                        .map((patient) => ({
                            visibleStatus: Patient.getVisibleStatus(
                                patient,
                                configuration.pretriageEnabled,
                                configuration.bluePatientsEnabled
                            ),
                            ...patient,
                        }))
            )
        );
        this.bufferedTransfers$ = this.store.select(bufferedTransfersSelector);
        this.activeActivities$ = this.store.select(activeActivitiesSelector);
        this.transferBehaviorState$ = this.store.select(
            transferBehaviorStateSelector
        );
        this.useableVehicles$ = this.store.select(
            vehiclesInSimulatedRegionSelector
        );

        this.reachableTransferPoints$ = this.store.select(
            reachableTransferPointsSelector
        );
        this.reachableHospitals$ = this.store.select(
            reachableHospitalsSelector
        );

        // remove if deleted
        this.useableVehicles$
            .pipe(takeUntil(this.destroy$))
            .subscribe((useableVehicles) => {
                if (
                    this.vehicleToSend &&
                    !useableVehicles.includes(this.vehicleToSend)
                ) {
                    this.vehicleToSend = undefined;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
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

    public patientClicked(patient: Patient) {
        if (
            !this.clickedPatients[patient.id] &&
            this.minPatients + 1 >
                (this.vehicleToSend?.patientCapacity ??
                    Number.POSITIVE_INFINITY)
        ) {
            return;
        }
        this.clickedPatients[patient.id] = !this.clickedPatients[patient.id];
        this.minPatients = Object.values(this.clickedPatients).filter(
            (it) => it
        ).length;
    }

    public sendVehicle() {
        if (!this.vehicleToSend || !this.selectedDestination) {
            return;
        }

        const patients: UUIDSet = Object.fromEntries(
            Object.entries(this.clickedPatients)
                .filter(([_, bool]) => bool)
                .map(([key, _]) => [key, true])
        );

        this.exerciseService.proposeAction({
            type: '[TransferBehavior] Send Transfer Request Event',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.transferBehaviorId,
            vehicleID: this.vehicleToSend.id,
            destinationType: this.selectedDestination.type,
            destinationId: this.selectedDestination.type.id,
            patients,
        });

        this.clickedPatients = {};
        this.vehicleToSend = undefined;
        this.minPatients = 0;
    }
}
