import type { SimulatedRegion } from '../../models';
import type { ExerciseState } from '../../state';
import type { Mutable } from '../../utils';
import { simulationActivityDictionary } from '../activities';
import { terminateActivity } from '../activities/utils';
import { simulationBehaviorDictionary } from '../behaviors';
import { TickEvent } from '../events/tick';
import { sendSimulationEvent } from '../events/utils';

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
        simulationActivityDictionary[activityState.type].tick(
            draftState,
            simulatedRegion,
            activityState as any,
            tickInterval,
            () => {
                terminateActivity(
                    draftState,
                    simulatedRegion,
                    activityState.id
                );
            }
        );
    });
}

function handleSimulationEvents(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>
) {
    simulatedRegion.behaviors.forEach((behaviorState) => {
        simulatedRegion.inEvents.forEach((event) => {
            simulationBehaviorDictionary[behaviorState.type].handleEvent(
                draftState,
                simulatedRegion,
                behaviorState as any,
                event
            );
        });
    });
    simulatedRegion.inEvents = [];
}
