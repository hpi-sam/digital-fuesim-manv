import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { DelayEventActivityState } from '../activities';
import { ReassignTreatmentsActivityState } from '../activities/reassign-treatments';
import { addActivity, terminateActivity } from '../activities/utils';
import { TreatmentsTimerEvent } from '../events/treatments-timer-event';
import { nextUUID } from '../utils/randomness';
import { TreatPatientsIntervals } from '../utils/treat-patients-intervals';
import {
    TreatmentProgress,
    treatmentProgressAllowedValues,
} from '../utils/treatment';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class TreatPatientsBehaviorState implements SimulationBehaviorState {
    @IsValue('treatPatientsBehavior' as const)
    readonly type = `treatPatientsBehavior`;

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @Type(() => TreatPatientsIntervals)
    @ValidateNested()
    public readonly intervals: TreatPatientsIntervals =
        TreatPatientsIntervals.create(
            1000 * 10, // 10 seconds
            1000 * 60, // 1 minute, as this is how long it takes to triage one patient
            1000 * 60 * 5, // 5 minutes
            1000 * 60 * 10, // 10 minutes
            1000 * 20 // 20 seconds
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
                case 'treatPatientIntervalsChangedEvent':
                    {
                        if (
                            event.newTreatPatientsIntervals[
                                behaviorState.treatmentProgress
                            ] !==
                                behaviorState.intervals[
                                    behaviorState.treatmentProgress
                                ] &&
                            behaviorState.delayActivityId !== null
                        ) {
                            const id = nextUUID(draftState);
                            terminateActivity(
                                draftState,
                                simulatedRegion,
                                behaviorState.delayActivityId
                            );
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
                        behaviorState.intervals =
                            event.newTreatPatientsIntervals;
                    }
                    break;
                default:
                // Ignore event
            }
        },
    };
