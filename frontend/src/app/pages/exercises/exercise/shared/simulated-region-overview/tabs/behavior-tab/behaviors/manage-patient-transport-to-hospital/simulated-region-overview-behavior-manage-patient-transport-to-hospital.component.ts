import type { OnChanges } from '@angular/core';
import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import type {
    ManagePatientTransportToHospitalBehaviorState,
    PatientStatus,
    PatientStatusForTransport,
    SimulatedRegion,
} from 'digital-fuesim-manv-shared';
import {
    StrictObject,
    patientStatusAllowedValues,
    patientStatusForTransportAllowedValues,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import type { AppState } from 'src/app/state/app.state';
import { selectConfiguration } from 'src/app/state/application/selectors/exercise.selectors';
import {
    createSelectBehaviorState,
    selectSimulatedRegions,
    selectVehicleTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector:
        'app-simulated-region-overview-behavior-manage-patient-transport-to-hospital',
    templateUrl:
        './simulated-region-overview-behavior-manage-patient-transport-to-hospital.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-manage-patient-transport-to-hospital.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorManagePatientTransportToHospitalComponent
    implements OnChanges
{
    @Input() simulatedRegionId!: UUID;
    @Input() behaviorId!: UUID;

    public behaviorState$!: Observable<ManagePatientTransportToHospitalBehaviorState>;
    public possibleRequestTargets$!: Observable<SimulatedRegion[]>;
    public managedSimulatedRegions$!: Observable<SimulatedRegion[]>;
    public possibleNewSimulatedRegionsToManage$!: Observable<SimulatedRegion[]>;
    public possibleNewVehicleTypesForTransport$!: Observable<{
        [key in PatientStatusForTransport]: string[];
    }>;
    public patientStatusOptions$!: Observable<PatientStatus[]>;

    public patientStatusForTransport = ['red', 'yellow', 'green'];

    public selectedSimulatedRegionId?: UUID;

    constructor(
        private readonly store: Store<AppState>,
        private readonly exerciseService: ExerciseService
    ) {}

    toggleSelectedRegion(simulatedRegionId: UUID) {
        if (this.selectedSimulatedRegionId === simulatedRegionId) {
            this.selectedSimulatedRegionId = undefined;
        } else {
            this.selectedSimulatedRegionId = simulatedRegionId;
        }
    }

    ngOnChanges() {
        this.behaviorState$ = this.store.select(
            createSelectBehaviorState<ManagePatientTransportToHospitalBehaviorState>(
                this.simulatedRegionId,
                this.behaviorId
            )
        );

        const simulatedRegions$ = this.store.select(selectSimulatedRegions);

        this.possibleRequestTargets$ = simulatedRegions$.pipe(
            map((simulatedRegions) =>
                Object.values(simulatedRegions).sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
            )
        );

        this.managedSimulatedRegions$ = combineLatest([
            this.behaviorState$,
            simulatedRegions$,
        ]).pipe(
            map(([behaviorState, simulatedRegions]) =>
                Object.keys(behaviorState.simulatedRegionsToManage).map(
                    (simulatedRegionId) => simulatedRegions[simulatedRegionId]!
                )
            )
        );

        this.possibleNewSimulatedRegionsToManage$ = combineLatest([
            this.behaviorState$,
            simulatedRegions$,
        ]).pipe(
            map(([behaviorState, simulatedRegions]) =>
                Object.values(simulatedRegions).filter(
                    (simulatedRegion) =>
                        !behaviorState.simulatedRegionsToManage[
                            simulatedRegion.id
                        ]
                )
            )
        );

        const vehicleTypes$ = this.store
            .select(selectVehicleTemplates)
            .pipe(
                map((vehicleTemplates) =>
                    vehicleTemplates.map(
                        (vehicleTemplate) => vehicleTemplate.name
                    )
                )
            );

        this.possibleNewVehicleTypesForTransport$ = combineLatest([
            this.behaviorState$,
            vehicleTypes$,
        ]).pipe(
            map(([behaviorState, vehicleTypes]) =>
                Object.fromEntries(
                    StrictObject.keys(
                        patientStatusForTransportAllowedValues
                    ).map((patientStatusForTransport) => [
                        patientStatusAllowedValues,
                        vehicleTypes.filter(
                            (vehicleType) =>
                                !behaviorState.vehiclesForPatients[
                                    patientStatusForTransport
                                ].includes(vehicleType)
                        ),
                    ])
                )
            )
        );

        const configuration$ = this.store.select(selectConfiguration);

        this.patientStatusOptions$ = configuration$.pipe(
            map((configuration) => {
                if (configuration.bluePatientsEnabled) {
                    return ['green', 'yellow', 'red', 'blue', 'black', 'white'];
                }
                return ['green', 'yellow', 'red', 'black', 'white'];
            })
        );
    }

    changeRequestTarget(requestTargetId: UUID) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Change Transport Request Target',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            requestTargetId,
        });
    }

    addSimulatedRegionToManage(managedSimulatedRegionId: UUID) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Add Simulated Region To Manage For Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            managedSimulatedRegionId,
        });
    }

    removeSimulatedRegionToManage(managedSimulatedRegionId: UUID) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Remove Simulated Region To Manage From Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            managedSimulatedRegionId,
        });
    }

    updatePatientsExpectedInRegion(
        managedSimulatedRegionId: UUID,
        patientsExpected: number,
        patientStatus: PatientStatus
    ) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Update Patients Expected In Region For Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            managedSimulatedRegionId,
            patientsExpected,
            patientStatus,
        });
    }

    addVehicleTypeForPatientTransport(
        vehicleTypeName: string,
        patientStatus: PatientStatusForTransport
    ) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Add Vehicle Type For Patient Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            vehicleTypeName,
            patientStatus,
        });
    }

    removeVehicleTypeForPatientTransport(
        vehicleTypeName: string,
        patientStatus: PatientStatusForTransport
    ) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Remove Vehicle Type For Patient Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            vehicleTypeName,
            patientStatus,
        });
    }

    updateRequestVehicleDelay(requestVehicleDelay: number) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Update Request Vehicle Delay For Patient Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            requestVehicleDelay,
        });
    }

    updateRequestPatientCountDelay(requestPatientCountDelay: number) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Update Request Patient Count Delay For Patient Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            requestPatientCountDelay,
        });
    }

    updatePromiseInvalidationInterval(promiseInvalidationInterval: number) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Update Promise Invalidation Interval For Patient Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            promiseInvalidationInterval,
        });
    }

    updateMaximumCategoryToTransport(
        maximumCategoryToTransport: PatientStatusForTransport
    ) {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Update Maximum Category To Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
            maximumCategoryToTransport,
        });
    }

    startTransport() {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Start Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
        });
    }

    stopTransport() {
        this.exerciseService.proposeAction({
            type: '[ManagePatientsTransportToHospitalBehavior] Stop Transport',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.behaviorId,
        });
    }
}
