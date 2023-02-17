import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsLiteralUnion, IsValue } from '../../utils/validators';
import { DelayEventActivityState } from '../activities';
import { ReassignTreatmentsActivityState } from '../activities/reassign-treatments';
import { TreatmentsTimerEvent } from '../events/treatments-timer-event';
import { nextUUID } from '../utils';
import { addActivity, terminateActivity } from '../utils/simulated-region';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export type TreatmentProgress = 'counted' | 'secured' | 'triaged' | 'unknown';

export const treatmentProgressAllowedValues: {
    [Key in TreatmentProgress]: true;
} = {
    counted: true,
    secured: true,
    triaged: true,
    unknown: true,
};

// TODO: Make configurable (like `TreatPatientsBehaviorState.interval`)
const progressIntervalMap: { [Key in TreatmentProgress]: number } = {
    /**
     *  The personnel just arrived and the situation in unclear
     */
    unknown: 1000 * 30, // 30 seconds

    /**
     * The patients have been counted
     */
    counted: 1000 * 60 * 2, // 2 minutes

    /**
     * All patients are triaged
     */
    triaged: 1000 * 60 * 5, // 5 minutes

    /**
     * There is enough personnel to fulfil each patient's treatment needs
     */
    secured: 1000 * 60 * 10, // 10 minutes
};

export class TreatPatientsBehaviorState implements SimulationBehaviorState {
    @IsValue('treatPatientsBehavior' as const)
    readonly type = `treatPatientsBehavior`;

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly delayActivityId: UUID | null = null;

    @IsLiteralUnion({
        unknown: true,
        counted: true,
        triaged: true,
        secured: true,
    })
    public readonly treatmentProgress: TreatmentProgress = 'unknown';

    /**
     * The time between automatic treatment reassignments, in milliseconds.
     * Reassignments might occur more frequent than specified here since changes of patients or available material and personnel trigger an immediate reassignment.
     */
    @IsInt()
    @Min(0)
    public readonly interval!: number;

    static readonly create = getCreate(this);
}

export const treatPatientsBehavior: SimulationBehavior<TreatPatientsBehaviorState> =
    {
        behaviorState: TreatPatientsBehaviorState,
        handleEvent(draftState, simulatedRegion, behaviorState, event) {
            switch (event.type) {
                case 'tickEvent':
                    if (behaviorState.delayActivityId === null) {
                        const id = nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            DelayEventActivityState.create(
                                id,
                                TreatmentsTimerEvent.create(),
                                // draftState.currentTime + behaviorState.interval
                                draftState.currentTime +
                                    progressIntervalMap[
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
                case 'treatmentsTimerEvent':
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

                    addActivity(
                        simulatedRegion,
                        ReassignTreatmentsActivityState.create(
                            nextUUID(draftState),
                            behaviorState.id
                        )
                    );
                    break;
                case 'treatmentProgressChangedEvent':
                    behaviorState.treatmentProgress = event.newProgress;
                    break;
                default:
                // Ignore event
            }
        },
    };
