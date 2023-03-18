import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { cloneDeepMutable } from '../../utils';
import type { ExerciseSimulationActivityState } from './exercise-simulation-activity';
import { simulationActivityDictionary } from './exercise-simulation-activity';

export function addActivity(
    simulatedRegion: Mutable<SimulatedRegion>,
    activityState: ExerciseSimulationActivityState
) {
    simulatedRegion.activities[activityState.id] =
        cloneDeepMutable(activityState);
}

export function terminateActivity(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    activityId: UUID
) {
    const activityType = simulatedRegion.activities[activityId]?.type;
    if (activityType) {
        const activity = simulationActivityDictionary[activityType];
        if (activity.onTerminate) {
            activity.onTerminate(draftState, simulatedRegion, activityId);
        }
        delete simulatedRegion.activities[activityId];
    }
}
