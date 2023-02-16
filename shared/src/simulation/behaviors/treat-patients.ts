import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { DelayEventActivityState } from '../activities/delay-event';
import { ReassignTreatmentsActivityState } from '../activities/reassign-treatments';
import { TreatmentsTimerEvent } from '../events/treatments-timer-event';
import { nextUUID } from '../utils';
import { addActivity, terminateActivity } from '../utils/simulated-region';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class TreatPatientsBehaviorState implements SimulationBehaviorState {
    @IsValue('treatPatientsBehavior' as const)
    readonly type = `treatPatientsBehavior`;

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public readonly delayActivityId: UUID | null = null;

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
                                draftState.currentTime + behaviorState.interval
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
                            nextUUID(draftState)
                        )
                    );
                    break;
                default:
                // Ignore event
            }
        },
    };
