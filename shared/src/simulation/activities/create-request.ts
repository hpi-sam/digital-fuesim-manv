import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type { RequestTarget } from '../../models/utils/request-target/request-target';
import {
    ExerciseRequestTargetConfiguration,
    requestTargetDictionary,
    requestTargetTypeOptions,
} from '../../models/utils/request-target/exercise-request-target';
import { VehicleResource } from '../../models/utils/vehicle-resource';
import { getCreate } from '../../models/utils/get-create';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class CreateRequestActivityState implements SimulationActivityState {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsValue('createRequestActivity')
    public readonly type = 'createRequestActivity';

    @Type(...requestTargetTypeOptions)
    @ValidateNested()
    public readonly targetConfiguration: ExerciseRequestTargetConfiguration;

    @Type(() => VehicleResource)
    @ValidateNested()
    public readonly requestedResource: VehicleResource;

    @IsString()
    public readonly key: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        target: ExerciseRequestTargetConfiguration,
        requestedResource: VehicleResource,
        key: string
    ) {
        this.id = id;
        this.targetConfiguration = target;
        this.requestedResource = requestedResource;
        this.key = key;
    }

    static readonly create = getCreate(this);
}

export const createRequestActivity: SimulationActivity<CreateRequestActivityState> =
    {
        activityState: CreateRequestActivityState,
        tick: (
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) => {
            const requestTarget = requestTargetDictionary[
                activityState.targetConfiguration.type
            ] as RequestTarget<ExerciseRequestTargetConfiguration>;
            requestTarget.createRequest(
                draftState,
                simulatedRegion.id,
                activityState.targetConfiguration,
                activityState.requestedResource,
                activityState.key
            );
            terminate();
        },
    };
