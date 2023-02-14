import { IsInt, IsUUID, Min } from 'class-validator';
import { getCreate } from '../../models/utils';
import { uuid, UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { DelayTreatmentReassignmentActivityState } from '../activities/delay-treatment-reassignment';
import { ReassignTreatmentsActivityState } from '../activities/reassign-treatments';
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
                    if (
                        !Object.values(simulatedRegion.activities).some(
                            (activity) =>
                                activity.type ===
                                'delayTreatmentReassignmentActivity'
                        )
                    ) {
                        addActivity(
                            simulatedRegion,
                            DelayTreatmentReassignmentActivityState.create(
                                draftState.currentTime + behaviorState.interval
                            )
                        );
                    }
                    break;
                case 'materialAvailableEvent':
                case 'newPatientEvent':
                case 'personnelAvailableEvent':
                    Object.values(simulatedRegion.activities)
                        .filter(
                            (activity) =>
                                activity.type ===
                                'delayTreatmentReassignmentActivity'
                        )
                        .forEach((activity) => {
                            terminateActivity(
                                draftState,
                                simulatedRegion,
                                activity.id
                            );
                        });

                    addActivity(
                        simulatedRegion,
                        ReassignTreatmentsActivityState.create()
                    );
                    break;
                default:
                // Ignore event
            }
        },
    };
