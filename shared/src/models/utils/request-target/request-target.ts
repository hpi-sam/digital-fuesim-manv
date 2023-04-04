import type { VehicleResource } from '../../../models';
import type { ExerciseState } from '../../../state';
import type { Constructor, Mutable, UUID } from '../../../utils';

export class RequestTargetConfiguration {
    public readonly type!: `${string}RequestTarget`;
}

export interface RequestTarget<T extends RequestTargetConfiguration> {
    readonly configuration: Constructor<T>;
    readonly createRequest: (
        draftState: Mutable<ExerciseState>,
        requestingSimulatedRegionId: UUID,
        configuration: Mutable<T>,
        requestedResource: Mutable<VehicleResource>
    ) => void;
}
