import type { SimulatedRegion } from '../../models';
import type { Mutable } from '../../utils';
import { cloneDeepMutable } from '../../utils';
import type { AllowedValues } from '../../utils/validators';
import type { ExerciseSimulationEvent } from './exercise-simulation-event';

export function sendSimulationEvent(
    simulatedRegion: Mutable<SimulatedRegion>,
    event: ExerciseSimulationEvent
) {
    simulatedRegion.inEvents.push(cloneDeepMutable(event));
}

export type TransferDestination = 'hospital' | 'transferPoint';

export const transferDestinationTypeAllowedValues: AllowedValues<TransferDestination> =
    {
        hospital: true,
        transferPoint: true,
    };
