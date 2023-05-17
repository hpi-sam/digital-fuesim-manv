import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils/get-create';
import {
    ExerciseRescueResource,
    rescueResourceTypeOptions,
} from '../../models/utils/rescue-resource';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { SimulationEvent } from './simulation-event';

export class ResourceRequiredEvent implements SimulationEvent {
    @IsValue('resourceRequiredEvent')
    readonly type = 'resourceRequiredEvent';

    @IsUUID(4, uuidValidationOptions)
    readonly requiringSimulatedRegionId: UUID;

    @ValidateNested()
    @Type(...rescueResourceTypeOptions)
    readonly requiredResource: ExerciseRescueResource;

    /**
     * Used for deduplication of needs between different events of this type
     */
    @IsString()
    readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        requiringSimulatedRegionId: UUID,
        requiredResource: ExerciseRescueResource,
        key: string
    ) {
        this.requiringSimulatedRegionId = requiringSimulatedRegionId;
        this.requiredResource = requiredResource;
        this.key = key;
    }

    static readonly create = getCreate(this);
}
