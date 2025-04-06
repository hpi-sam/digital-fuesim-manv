import type { VehicleResource } from '../../../models/index.js';
import type { ExerciseState } from '../../../state.js';
import type { Constructor, Mutable, UUID } from '../../../utils/index.js';

export class RequestTargetConfiguration {
    public readonly type!: `${string}RequestTarget`;
}

export interface RequestTarget<T extends RequestTargetConfiguration> {
    readonly configuration: Constructor<T>;
    readonly createRequest: (
        draftState: Mutable<ExerciseState>,
        requestingSimulatedRegionId: UUID,
        configuration: Mutable<T>,
        requestedResource: Mutable<VehicleResource>,
        key: string
    ) => void;
}
