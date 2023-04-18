import {
    IsInt,
    IsNumber,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
    TreatPatientsBehaviorState,
    UnloadArrivingVehiclesBehaviorState,
} from '../../simulation';
import {
    updateBehaviorsRequestTarget,
    updateBehaviorsRequestInterval,
    ReportableInformation,
    reportableInformationAllowedValues,
    RecurringEventActivityState,
} from '../../simulation';
import { StartCollectingInformationEvent } from '../../simulation/events/start-collecting';
import { sendSimulationEvent } from '../../simulation/events/utils';
import { nextUUID } from '../../simulation/utils/randomness';
import type { Mutable } from '../../utils';
import {
    UUID,
    uuidValidationOptions,
    cloneDeepMutable,
    uuidArrayValidationOptions,
} from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import type { Action, ActionReducer } from '../action-reducer';
import { ExpectedReducerError, ReducerError } from '../reducer-error';
import {
    requestTargetTypeOptions,
    ExerciseRequestTargetConfiguration,
} from '../../models';
import { getActivityById, getBehaviorById, getElement } from './utils';

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

export class ProvidePersonnelBehaviorUpdateVehiclePrioritiesAction
    implements Action
{
    @IsValue('[ProvidePersonnelBehavior] Update VehiclePriorities' as const)
    public readonly type =
        '[ProvidePersonnelBehavior] Update VehiclePriorities';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsUUID(4, uuidArrayValidationOptions)
    public readonly priorities!: readonly UUID[];
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

export class UpdateRequestIntervalAction implements Action {
    @IsValue('[RequestBehavior] Update RequestInterval')
    public readonly type = '[RequestBehavior] Update RequestInterval';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsInt()
    @Min(0)
    public readonly requestInterval!: number;
}

export class UpdateRequestTargetAction implements Action {
    @IsValue('[RequestBehavior] Update RequestTarget')
    public readonly type = '[RequestBehavior] Update RequestTarget';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @Type(...requestTargetTypeOptions)
    @ValidateNested()
    public readonly requestTarget!: ExerciseRequestTargetConfiguration;
}

export class UpdatePromiseInvalidationIntervalAction implements Action {
    @IsValue('[RequestBehavior] Update Promise invalidation interval')
    public readonly type =
        '[RequestBehavior] Update Promise invalidation interval';

    @IsUUID(4, uuidValidationOptions)
    public readonly simulatedRegionId!: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly behaviorId!: UUID;

    @IsInt()
    @Min(0)
    public readonly promiseInvalidationInterval!: number;
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
            sendSimulationEvent(
                simulatedRegion,
                StartCollectingInformationEvent.create(informationType)
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
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const reportBehaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'reportBehavior'
                );
                if (!reportBehaviorState) {
                    throw new ReducerError(
                        `The simulated region with id ${simulatedRegionId} has no behavior with id ${behaviorId}.`
                    );
                }

                if (reportBehaviorState.activityIds[informationType]) {
                    throw new ExpectedReducerError(
                        `The behavior with id ${behaviorId} already has a recurring report for information type ${informationType}.`
                    );
                }

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
                const reportBehaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'reportBehavior'
                );
                const activityId =
                    reportBehaviorState.activityIds[informationType];
                if (!activityId) {
                    throw new ReducerError(
                        `The behavior with id ${behaviorId} has no recurring report for information type ${informationType}.`
                    );
                }
                const recurringActivityState = getActivityById(
                    draftState,
                    simulatedRegionId,
                    activityId,
                    'recurringEventActivity'
                );

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
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                const reportBehaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'reportBehavior'
                );
                const activityId =
                    reportBehaviorState.activityIds[informationType];
                if (!activityId) {
                    throw new ReducerError(
                        `The behavior with id ${behaviorId} has no recurring report for information type ${informationType}.`
                    );
                }
                getActivityById(
                    draftState,
                    simulatedRegionId,
                    activityId,
                    'recurringEventActivity'
                );
                delete reportBehaviorState.activityIds[informationType];
                delete simulatedRegion.activities[activityId];

                return draftState;
            },
            rights: 'trainer',
        };

    export const updateRequestInterval: ActionReducer<UpdateRequestIntervalAction> =
        {
            action: UpdateRequestIntervalAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, requestInterval }
            ) {
                const behaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'requestBehavior'
                );
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                updateBehaviorsRequestInterval(
                    draftState,
                    simulatedRegion,
                    behaviorState,
                    requestInterval
                );
                return draftState;
            },
            rights: 'trainer',
        };

    export const updateRequestTarget: ActionReducer<UpdateRequestTargetAction> =
        {
            action: UpdateRequestTargetAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, requestTarget }
            ) {
                const behaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'requestBehavior'
                );
                const simulatedRegion = getElement(
                    draftState,
                    'simulatedRegion',
                    simulatedRegionId
                );
                updateBehaviorsRequestTarget(
                    draftState,
                    simulatedRegion,
                    behaviorState,
                    requestTarget
                );
                return draftState;
            },
            rights: 'trainer',
        };

    export const updatePromiseInvalidationInterval: ActionReducer<UpdatePromiseInvalidationIntervalAction> =
        {
            action: UpdatePromiseInvalidationIntervalAction,
            reducer(
                draftState,
                { simulatedRegionId, behaviorId, promiseInvalidationInterval }
            ) {
                const behaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'requestBehavior'
                );
                behaviorState.invalidatePromiseInterval =
                    promiseInvalidationInterval;
                return draftState;
            },
            rights: 'trainer',
        };

    export const updateTreatmentVehiclePriorities: ActionReducer<ProvidePersonnelBehaviorUpdateVehiclePrioritiesAction> =
        {
            action: ProvidePersonnelBehaviorUpdateVehiclePrioritiesAction,
            reducer(draftState, { simulatedRegionId, behaviorId, priorities }) {
                const behaviorState = getBehaviorById(
                    draftState,
                    simulatedRegionId,
                    behaviorId,
                    'providePersonnelBehavior'
                );

                behaviorState.vehicleTemplatePriorities =
                    cloneDeepMutable(priorities);

                return draftState;
            },
            rights: 'trainer',
        };
}
