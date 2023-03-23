import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { RadiogramUnpublishedStatus } from '../../models/radiogram/status/radiogram-unpublished-status';
import type {
    ReportBehaviorState,
    TreatPatientsBehaviorState,
    UnloadArrivingVehiclesBehaviorState,
} from '../../simulation';
import {
    createRadiogramMap,
    ReportableInformation,
    reportableInformationAllowedValues,
    RecurringEventActivityState,
} from '../../simulation';
import { GenerateReportActivityState } from '../../simulation/activities/generate-report';
import { CollectInformationEvent } from '../../simulation/events/collect';
import { StartCollectingInformationEvent } from '../../simulation/events/start-collecting';
import { nextUUID } from '../../simulation/utils/randomness';
import type { Mutable } from '../../utils';
import { UUID, uuidValidationOptions, cloneDeepMutable } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ReducerError } from '../reducer-error';
import { getElement } from './utils';

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

export class CreateReportAction implements Action {
    @IsValue('[ReportBehavior] Create Report')
    public readonly type = '[ReportBehavior] Create Report';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsLiteralUnion(reportableInformationAllowedValues)
    public readonly informationType!: ReportableInformation;
}

export class CreateRecurringReportsAction implements Action {
    @IsValue('[ReportBehavior] Create Recurring Report')
    public readonly type = '[ReportBehavior] Create Recurring Report';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsNumber()
    @Min(0)
    public readonly interval!: number;

    @IsLiteralUnion(reportableInformationAllowedValues)
    public readonly informationType!: ReportableInformation;
}

export class UpdateRecurringReportsAction implements Action {
    @IsValue('[ReportBehavior] Update Recurring Report')
    public readonly type = '[ReportBehavior] Update Recurring Report';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsNumber()
    @Min(0)
    public readonly interval!: number;

    @IsLiteralUnion(reportableInformationAllowedValues)
    public readonly informationType!: ReportableInformation;
}

export class RemoveRecurringReportsAction implements Action {
    @IsValue('[ReportBehavior] Remove Recurring Report')
    public readonly type = '[ReportBehavior] Remove Recurring Report';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsLiteralUnion(reportableInformationAllowedValues)
    public readonly informationType!: ReportableInformation;
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

    export const createReport: ActionReducer<CreateReportAction> = {
        action: CreateReportAction,
        reducer(draftState, { simulatedRegionId, informationType }) {
            const simulatedRegion = getElement(
                draftState,
                'simulatedRegion',
                simulatedRegionId
            );
            const activityId = nextUUID(draftState);
            simulatedRegion.activities[activityId] = cloneDeepMutable(
                GenerateReportActivityState.create(
                    activityId,
                    createRadiogramMap[informationType](
                        nextUUID(draftState),
                        simulatedRegionId,
                        RadiogramUnpublishedStatus.create()
                    ),
                    CollectInformationEvent.create(activityId, informationType)
                )
            );

            return draftState;
        },
        rights: 'trainer',
    };

    export const createRecurringReports: ActionReducer<CreateRecurringReportsAction> =
        {
            action: CreateRecurringReportsAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, interval, informationType }
            ) {
                const simulatedRegion =
                    draftState.simulatedRegions[simulatedRegionId]!;
                const reportBehaviorState = simulatedRegion.behaviors.find(
                    (behaviorState) => behaviorState.id === behaviorId
                ) as Mutable<ReportBehaviorState>;

                const activityId = nextUUID(draftState);
                reportBehaviorState.activityIds[informationType] = activityId;
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    RecurringEventActivityState.create(
                        activityId,
                        StartCollectingInformationEvent.create(informationType),
                        draftState.currentTime + interval,
                        interval
                    )
                );

                return draftState;
            },
            rights: 'trainer',
        };

    export const updateRecurringReports: ActionReducer<UpdateRecurringReportsAction> =
        {
            action: UpdateRecurringReportsAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, interval, informationType }
            ) {
                const simulatedRegion =
                    draftState.simulatedRegions[simulatedRegionId]!;
                const reportBehaviorState = simulatedRegion.behaviors.find(
                    (behaviorState) => behaviorState.id === behaviorId
                ) as Mutable<ReportBehaviorState>;
                const activityId =
                    reportBehaviorState.activityIds[informationType]!;
                const recurringActivityState = simulatedRegion.activities[
                    activityId
                ] as Mutable<RecurringEventActivityState>;

                recurringActivityState.recurrenceIntervalTime = interval;

                return draftState;
            },
            rights: 'trainer',
        };

    export const removeRecurringReports: ActionReducer<RemoveRecurringReportsAction> =
        {
            action: RemoveRecurringReportsAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, informationType }
            ) {
                const simulatedRegion =
                    draftState.simulatedRegions[simulatedRegionId]!;
                const reportBehaviorState = simulatedRegion.behaviors.find(
                    (behaviorState) => behaviorState.id === behaviorId
                ) as Mutable<ReportBehaviorState>;
                const activityId =
                    reportBehaviorState.activityIds[informationType]!;
                delete reportBehaviorState.activityIds[informationType];
                delete simulatedRegion.activities[activityId];

                return draftState;
            },
            rights: 'trainer',
        };
}
