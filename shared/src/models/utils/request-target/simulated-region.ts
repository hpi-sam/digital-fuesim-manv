import { IsUUID } from 'class-validator';
import { UUID } from '../../../utils/uuid';
import { IsValue } from '../../../utils/validators/is-value';
import { getCreate } from '../../../models/utils/get-create';
import { getElement } from '../../../store/action-reducers/utils/get-element';
import { sendSimulationEvent } from '../../../simulation/events/utils';
import { ResourceRequiredEvent } from '../../../simulation/events/resources-required';
import type {
    RequestTarget,
    RequestTargetConfiguration,
} from './request-target';

export class SimulatedRegionRequestTargetConfiguration
    implements RequestTargetConfiguration
{
    @IsValue('simulatedRegionRequestTarget')
    public readonly type = 'simulatedRegionRequestTarget';

    @IsUUID()
    public readonly targetSimulatedRegionId: UUID;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(targetSimulatedRegionId: UUID) {
        this.targetSimulatedRegionId = targetSimulatedRegionId;
    }

    static readonly create = getCreate(this);
}

export const simulatedRegionRequestTarget: RequestTarget<SimulatedRegionRequestTargetConfiguration> =
    {
        configuration: SimulatedRegionRequestTargetConfiguration,
        createRequest: (
            draftState,
            requestingSimulatedRegionId,
            configuration,
            requestedResource,
            key
        ) => {
            sendSimulationEvent(
                getElement(
                    draftState,
                    'simulatedRegion',
                    configuration.targetSimulatedRegionId
                ),
                ResourceRequiredEvent.create(
                    requestingSimulatedRegionId,
                    requestedResource,
                    key
                )
            );
        },
    };
