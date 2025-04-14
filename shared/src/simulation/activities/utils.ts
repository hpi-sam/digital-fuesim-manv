import type { SimulatedRegion } from '../../models/index.js';
import type { ExerciseState } from '../../state.js';
import type { Mutable, UUID } from '../../utils/index.js';
import { cloneDeepMutable } from '../../utils/index.js';
import type { ExerciseSimulationActivityState } from './exercise-simulation-activity.js';
import { simulationActivityDictionary } from './exercise-simulation-activity.js';

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
