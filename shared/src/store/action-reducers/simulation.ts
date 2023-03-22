import { Type } from 'class-transformer';
import {
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import type {
    RecurringEventActivityState,
    ReportBehaviorState,
    TreatPatientsBehaviorState,
    UnloadArrivingVehiclesBehaviorState,
} from '../../simulation';
import { reportableInformations } from '../../simulation';
import type { Mutable } from '../../utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils';
import { ReportIntervalConfiguration } from './utils/report-intervals';

export class UpdateTreatPatientsIntervalsAction implements Action {
    @IsValue('[TreatPatientsBehavior] Update TreatPatientsIntervals' as const)
    public readonly type =
        '[TreatPatientsBehavior] Update TreatPatientsIntervals';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorStateId!: UUID;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly unknown?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly counted?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly triaged?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly secured?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    public readonly countingTimePerPatient?: number;
}

export class UnloadArrivingVehiclesBehaviorUpdateUnloadDelayAction
    implements Action
{
    @IsValue('[UnloadArrivingVehiclesBehavior] Update UnloadDelay' as const)
    public readonly type =
        '[UnloadArrivingVehiclesBehavior] Update UnloadDelay';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsNumber()
    @Min(0)
    public readonly unloadDelay!: number;
}

export class UpdateReportIntervalsAction implements Action {
    @IsValue('[ReportBehavior] Update ReportIntervals' as const)
    public readonly type = '[ReportBehavior] Update ReportIntervals';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsOptional()
    @Type(() => ReportIntervalConfiguration)
    @ValidateNested()
    public readonly patientCountReportInterval?: ReportIntervalConfiguration;

    @IsOptional()
    @Type(() => ReportIntervalConfiguration)
    @ValidateNested()
    public readonly vehicleCountReportInterval?: ReportIntervalConfiguration;

    @IsOptional()
    @Type(() => ReportIntervalConfiguration)
    @ValidateNested()
    public readonly personnelCountReportInterval?: ReportIntervalConfiguration;

    @IsOptional()
    @Type(() => ReportIntervalConfiguration)
    @ValidateNested()
    public readonly materialCountReportInterval?: ReportIntervalConfiguration;

    @IsOptional()
    @Type(() => ReportIntervalConfiguration)
    @ValidateNested()
    public readonly treatmentStatusReportInterval?: ReportIntervalConfiguration;
}

export namespace SimulationActionReducers {
    export const updateTreatPatientsIntervals: ActionReducer<UpdateTreatPatientsIntervalsAction> =
        {
            action: UpdateTreatPatientsIntervalsAction,
            /*
             *   unknown, counted, triaged, secured, countingTimePerPatient stay the same when undefined
             */
            reducer: (
                draftState,
                {
                    simulatedRegionId,
                    behaviorStateId,
                    unknown,
                    counted,
                    triaged,
                    secured,
                    countingTimePerPatient,
                }
            ) => {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const behaviorStates = simulatedRegion.behaviors;
                const treatPatientsBehaviorState = behaviorStates.find(
                    (behaviorState) => behaviorState.id === behaviorStateId
                ) as Mutable<TreatPatientsBehaviorState>;
                if (unknown !== undefined) {
                    treatPatientsBehaviorState.intervals.unknown = unknown;
                }
                if (counted !== undefined) {
                    treatPatientsBehaviorState.intervals.counted = counted;
                }
                if (triaged !== undefined) {
                    treatPatientsBehaviorState.intervals.triaged = triaged;
                }
                if (secured !== undefined) {
                    treatPatientsBehaviorState.intervals.secured = secured;
                }
                if (countingTimePerPatient !== undefined) {
                    treatPatientsBehaviorState.intervals.countingTimePerPatient =
                        countingTimePerPatient;
                }
                return draftState;
            },
            rights: 'trainer',
        };

    export const unloadArrivingVehiclesBehaviorUpdateUnloadDelay: ActionReducer<UnloadArrivingVehiclesBehaviorUpdateUnloadDelayAction> =
        {
            action: UnloadArrivingVehiclesBehaviorUpdateUnloadDelayAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, unloadDelay }
            ) {
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const behaviorState = simulatedRegion.behaviors.find(
                    (behavior) => behavior.id === behaviorId
                ) as Mutable<UnloadArrivingVehiclesBehaviorState>;
                if (behaviorState) {
                    behaviorState.unloadDelay = unloadDelay;
                } else {
                    throw new ReducerError(
                        `The simulated region with id ${simulatedRegionId} has no behavior with id ${behaviorId}.`
                    );
                }
                return draftState;
            },
            rights: 'trainer',
        };

    export const updateReportIntervals: ActionReducer<UpdateReportIntervalsAction> =
        {
            action: UpdateReportIntervalsAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, ...reportIntervals }
            ) {
                const simulatedRegion =
                    draftState.simulatedRegions[simulatedRegionId]!;
                const reportBehaviorState = simulatedRegion.behaviors.find(
                    (behaviorState) => behaviorState.id === behaviorId
                ) as Mutable<ReportBehaviorState>;

                reportableInformations.forEach((reportableInformation) => {
                    if (
                        !reportIntervals[
                            `${reportableInformation}ReportInterval`
                        ]
                    )
                        return;

                    const intervalConfiguration =
                        reportIntervals[
                            `${reportableInformation}ReportInterval`
                        ]!;
                    const activityId =
                        reportBehaviorState[
                            `${reportableInformation}ActivityId`
                        ]!;
                    const recurringActivityState = simulatedRegion.activities[
                        activityId
                    ] as Mutable<RecurringEventActivityState>;

                    if (intervalConfiguration.enabled !== undefined) {
                        recurringActivityState.enabled =
                            intervalConfiguration.enabled;
                    }

                    if (intervalConfiguration.interval !== undefined) {
                        recurringActivityState.recurrenceIntervalTime =
                            intervalConfiguration.interval;
                    }
                });

                return draftState;
            },
            rights: 'trainer',
        };
}
