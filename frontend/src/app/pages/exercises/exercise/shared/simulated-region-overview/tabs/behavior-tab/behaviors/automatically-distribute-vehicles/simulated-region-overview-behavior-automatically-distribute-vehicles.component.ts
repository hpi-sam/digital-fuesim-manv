import { Component, Input, OnInit } from '@angular/core';
import { createSelector, Store } from '@ngrx/store';
import {
    isInSpecificSimulatedRegion,
    TransferPoint,
    UUID,
    UUIDSet,
    VehicleTemplate,
} from 'digital-fuesim-manv-shared';
import { AutomaticallyDistributeVehiclesBehaviorState } from 'digital-fuesim-manv-shared/dist/simulation/behaviors/automatically-distribute-vehicles';
import { Observable } from 'rxjs';
import { ExerciseService } from 'src/app/core/exercise.service';
import { AppState } from 'src/app/state/app.state';
import {
    createSelectBehaviorState,
    selectTransferPoints,
    selectVehicleTemplates,
} from 'src/app/state/application/selectors/exercise.selectors';

@Component({
    selector:
        'app-simulated-region-overview-behavior-automatically-distribute-vehicles',
    templateUrl:
        './simulated-region-overview-behavior-automatically-distribute-vehicles.component.html',
    styleUrls: [
        './simulated-region-overview-behavior-automatically-distribute-vehicles.component.scss',
    ],
})
export class SimulatedRegionOverviewBehaviorAutomaticallyDistributeVehiclesComponent
    implements OnInit
{
    public transferPointsToBeAdded$!: Observable<{
        [k: string]: TransferPoint;
    }>;

    public getTransferPointOrderByValue: (
        transferPoint: TransferPoint
    ) => string = (transferPoint) => TransferPoint.getFullName(transferPoint);

    @Input() simulatedRegionId!: UUID;
    @Input() automaticallyDistributeVehiclesBehaviorId!: UUID;

    public readonly infinity = Number.MAX_VALUE;

    public automaticallyDistributeVehiclesBehaviorState$!: Observable<AutomaticallyDistributeVehiclesBehaviorState>;
    public distributionLimits$!: Observable<
        { vehicleType: string; vehicleAmount: number }[]
    >;
    public addableVehicleTypes$!: Observable<string[]>;
    public distributionDestinations$!: Observable<
        { name: string; id: string }[]
    >;

    constructor(
        private readonly exerciseService: ExerciseService,
        private readonly store: Store<AppState>
    ) {}

    ngOnInit(): void {
        const automaticallyDistributeVehiclesBehaviorStateSelector =
            createSelectBehaviorState<AutomaticallyDistributeVehiclesBehaviorState>(
                this.simulatedRegionId,
                this.automaticallyDistributeVehiclesBehaviorId
            );
        this.automaticallyDistributeVehiclesBehaviorState$ = this.store.select(
            automaticallyDistributeVehiclesBehaviorStateSelector
        );
        const distributionLimitsSelector = createSelector(
            automaticallyDistributeVehiclesBehaviorStateSelector,
            (automaticallyDistributeVehiclesBehaviorState) =>
                Object.entries(
                    automaticallyDistributeVehiclesBehaviorState.distributionLimits
                )
                    .filter(
                        ([_vehicleType, vehicleAmount]) => vehicleAmount > 0
                    )
                    .map(([vehicleType, vehicleAmount]) => {
                        return { vehicleType, vehicleAmount };
                    })
        );
        this.distributionLimits$ = this.store.select(
            distributionLimitsSelector
        );

        const presentVehicleTypesSelector = createSelector(
            distributionLimitsSelector,
            (distributionLimits) =>
                distributionLimits.map(
                    (distributionLimit) => distributionLimit.vehicleType
                )
        );
        const presentDistributionDestinationsSelector = createSelector(
            automaticallyDistributeVehiclesBehaviorStateSelector,
            (automaticallyDistributeVehiclesBehaviorState) =>
                automaticallyDistributeVehiclesBehaviorState.distributionDestinations
        );

        const addableVehicleTypesSelector = createSelector(
            selectVehicleTemplates,
            presentVehicleTypesSelector,
            (vehicleTemplates, presentVehicleTypes) =>
                vehicleTemplates
                    .map((vehicleTemplate) => vehicleTemplate.vehicleType)
                    .filter(
                        (vehicleType) =>
                            !presentVehicleTypes.includes(vehicleType)
                    )
        );

        this.addableVehicleTypes$ = this.store.select(
            addableVehicleTypesSelector
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

        this.transferPointsToBeAdded$ = this.store.select(
            createSelector(
                selectTransferPoints,
                ownTransferPointSelector,
                presentDistributionDestinationsSelector,
                (
                    transferPoints,
                    ownTransferPoint,
                    presentDistributionDestinations
                ) => {
                    return Object.fromEntries(
                        Object.entries(transferPoints).filter(
                            ([key]) =>
                                key !== ownTransferPoint.id &&
                                !presentDistributionDestinations[key]
                        )
                    );
                }
            )
        );

        const distributionDestinationsSelector = createSelector(
            presentDistributionDestinationsSelector,
            selectTransferPoints,
            (presentDestinations, transferPoints) =>
                Object.keys(presentDestinations).map((destinationId) => {
                    return {
                        name: transferPoints[destinationId]!.externalName,
                        id: destinationId,
                    };
                })
        );

        this.distributionDestinations$ = this.store.select(
            distributionDestinationsSelector
        );
    }

    public addVehicle(vehicleType: string) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Change Limit',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            vehicleType,
            newLimit: 1,
        });
    }

    public removeVehicle(vehicleType: string) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Change Limit',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            vehicleType,
            newLimit: 0,
        });
    }

    public changeLimitOfVehicle(vehicleType: string, newLimit: number) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Change Limit',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            vehicleType,
            newLimit,
        });
    }

    public unlimitedLimitOfVehicle(vehicleType: string) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Change Limit',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            vehicleType,
            newLimit: this.infinity,
        });
    }

    public limitedLimitOfVehicle(
        vehicleType: string,
        currentlyDistributed: number
    ) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Change Limit',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            vehicleType,
            newLimit: currentlyDistributed,
        });
    }

    public addDistributionDestination(destinationId: UUID) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Add Destination',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            destinationId,
        });
    }

    public removeDistributionDestination(destinationId: UUID) {
        this.exerciseService.proposeAction({
            type: '[AutomaticDistributionBehavior] Remove Destination',
            simulatedRegionId: this.simulatedRegionId,
            behaviorId: this.automaticallyDistributeVehiclesBehaviorId,
            destinationId,
        });
    }
}
