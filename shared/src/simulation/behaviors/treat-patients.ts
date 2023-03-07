import { Type } from 'class-transformer';
import {
    IsInt,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { DelayEventActivityState } from '../activities';
import { ReassignTreatmentsActivityState } from '../activities/reassign-treatments';
import { addActivity, terminateActivity } from '../activities/utils';
import { TreatmentsTimerEvent } from '../events/treatments-timer-event';
import { nextUUID } from '../utils/randomness';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../utils/treatment';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class TreatPatientsIntervals {
    /**
     * How frequent reassignments should occur when the personnel just arrived and the situation in unclear
     */
    @IsInt()
    @Min(0)
    public readonly unknown: number;

    /**
     * How frequent reassignments should occur when the patients have been counted
     */
    @IsInt()
    @Min(0)
    public readonly counted: number;

    /**
     * How frequent reassignments should occur when all patients are triaged
     */
    @IsInt()
    @Min(0)
    public readonly triaged: number;

    /**
     * How frequent reassignments should occur when there is enough personnel to fulfil each patient's treatment needs
     */
    @IsInt()
    @Min(0)
    public readonly secured: number;

    /**
     * How long counting each patient should take.
     * Counting will be finished after {patient count} times this value.
     */
    @IsInt()
    @Min(0)
    public readonly countingTimePerPatient: number;

    constructor(
        unknown: number,
        counted: number,
        triaged: number,
        secured: number,
        countingTimePerPatient: number
    ) {
        this.unknown = unknown;
        this.counted = counted;
        this.triaged = triaged;
        this.secured = secured;
        this.countingTimePerPatient = countingTimePerPatient;
    }

    static readonly create = getCreate(this);
}

export class TreatPatientsBehaviorState implements SimulationBehaviorState {
    @IsValue('treatPatientsBehavior' as const)
    readonly type = `treatPatientsBehavior`;

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @Type(() => TreatPatientsIntervals)
    @ValidateNested()
    public readonly intervals: TreatPatientsIntervals =
        TreatPatientsIntervals.create(
            10000, //1000 * 10, // 10 seconds
            10000, //1000 * 60, // 1 minute, as this is how long it takes to triage one patient
            10000, //1000 * 60 * 5, // 5 minutes
            10000, //1000 * 60 * 10, // 10 minutes
            1000 //1000 * 20 // 20 seconds
        );

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly delayActivityId: UUID | null = null;

    @IsOptional()
    @IsUUID(4, uuidValidationOptions)
    public readonly treatmentActivityId: UUID | null = null;

    @IsLiteralUnion(treatmentProgressAllowedValues)
    public readonly treatmentProgress: TreatmentProgress = 'unknown';

    static readonly create = getCreate(this);
}

export const treatPatientsBehavior: SimulationBehavior<TreatPatientsBehaviorState> =
    {
        behaviorState: TreatPatientsBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            switch (event.type) {
                case 'tickEvent':
                    if (
                        behaviorState.delayActivityId === null &&
                        (behaviorState.treatmentActivityId === null ||
                            simulatedRegion.activities[
                                behaviorState.treatmentActivityId
                            ] === undefined)
                    ) {
                        const id = nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            DelayEventActivityState.create(
                                id,
                                TreatmentsTimerEvent.create(),
                                draftState.currentTime +
                                    behaviorState.intervals[
                                        behaviorState.treatmentProgress
                                    ]
                            )
                        );
                        behaviorState.delayActivityId = id;
                    }
                    break;
                case 'materialAvailableEvent':
                case 'newPatientEvent':
                case 'personnelAvailableEvent':
                case 'treatmentsTimerEvent': {
                    if (behaviorState.delayActivityId) {
                        if (
                            simulatedRegion.activities[
                                behaviorState.delayActivityId
                            ]
                        ) {
                            terminateActivity(
                                draftState,
                                simulatedRegion,
                                behaviorState.delayActivityId
                            );
                        }

                        behaviorState.delayActivityId = null;
                    }

                    if (
                        behaviorState.treatmentActivityId &&
                        simulatedRegion.activities[
                            behaviorState.treatmentActivityId
                        ]
                    ) {
                        terminateActivity(
                            draftState,
                            simulatedRegion,
                            behaviorState.treatmentActivityId
                        );
                        behaviorState.treatmentActivityId = null;
                    }

                    const id = nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        ReassignTreatmentsActivityState.create(
                            id,
                            behaviorState.treatmentProgress,
                            behaviorState.intervals.countingTimePerPatient
                        )
                    );
                    behaviorState.treatmentActivityId = id;
                    break;
                }
                case 'treatmentProgressChangedEvent':
                    behaviorState.treatmentProgress = event.newProgress;
                    break;
                default:
                // Ignore event
            }
        },
    };
