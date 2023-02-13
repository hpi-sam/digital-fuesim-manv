import type { SimulatedRegion} from '../../models';
import type { ExerciseState } from '../../state';
import type { Mutable, UUID } from '../../utils';
import { cloneDeepMutable } from '../../utils';
import type { ExerciseSimulationActivityState } from '../activities';
import { simulationActivityDirectory as simulationActivityDictionary } from '../activities';
import { simulationBehaviorDirectory } from '../behaviors';
import type { ExerciseSimulationEvent } from '../events';
import { TickEvent } from '../events/tick';

export function simulateAllRegions(
    draftState: Mutable<ExerciseState>,
    tickInterval: number
) {
    Object.values(draftState.simulatedRegions).forEach((simulatedRegion) => {
        simulateSingleRegion(draftState, simulatedRegion, tickInterval);
    });
}

function simulateSingleRegion(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    tickInterval: number
) {
    sendSimulationEvent(simulatedRegion, TickEvent.create(tickInterval));
    handleSimulationEvents(draftState, simulatedRegion);
    tickActivities(draftState, simulatedRegion, tickInterval);
}

function tickActivities(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    tickInterval: number
) {
    Object.values(simulatedRegion.activities).forEach((activityState) => {
        // TODO: remove '?' by adding stricter typing to the dictionary
        simulationActivityDictionary[activityState.type]?.tick(
            draftState,
            simulatedRegion,
            activityState,
            tickInterval
        );
    });
}

function handleSimulationEvents(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>
) {
    simulatedRegion.behaviors.forEach((behaviorState) => {
        simulatedRegion.inEvents.forEach((event) => {
            // TODO: remove '?' by adding stricter typing to the directory
            simulationBehaviorDirectory[behaviorState.type]?.handleEvent(
                draftState,
                event,
                behaviorState,
                simulatedRegion
            );
        });
    });
    simulatedRegion.inEvents = [];
}

export function sendSimulationEvent(
    simulatedRegion: Mutable<SimulatedRegion>,
    event: ExerciseSimulationEvent
) {
    simulatedRegion.inEvents.push(cloneDeepMutable(event));
}

export function addActivity(
    simulatedRegion: Mutable<SimulatedRegion>,
    activityState: ExerciseSimulationActivityState
) {
    simulatedRegion.activities[activityState.id] =
        cloneDeepMutable(activityState);
}

export function removeActivity(
    simulatedRegion: Mutable<SimulatedRegion>,
    activityId: UUID
) {
    // TODO: Maybe add a proper teardown function to SimulatedActivity
    delete simulatedRegion.activities[activityId];
}
