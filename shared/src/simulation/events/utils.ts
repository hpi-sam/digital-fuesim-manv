import type { SimulatedRegion } from '../../models/index.js';
import type { Mutable } from '../../utils/index.js';
import { cloneDeepMutable } from '../../utils/index.js';
import type { ExerciseSimulationEvent } from './exercise-simulation-event.js';

export function sendSimulationEvent(
    simulatedRegion: Mutable<SimulatedRegion>,
    event: ExerciseSimulationEvent
) {
    simulatedRegion.inEvents.push(cloneDeepMutable(event));
}
