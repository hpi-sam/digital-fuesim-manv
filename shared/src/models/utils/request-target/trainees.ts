import { IsValue } from '../../../utils/validators/is-value';
import { cloneDeepMutable } from '../../../utils/clone-deep';
import { getCreate } from '../../../models/utils/get-create';
import { RadiogramUnpublishedStatus } from '../../../models/radiogram/status/radiogram-unpublished-status';
import { publishRadiogram } from '../../../models/radiogram/radiogram-helpers-mutable';
import { nextUUID } from '../../../simulation/utils/randomness';
import { ResourceRequestRadiogram } from '../../radiogram/resource-request-radiogram';
import type {
    RequestTarget,
    RequestTargetConfiguration,
} from './request-target';

export class TraineesRequestTargetConfiguration
    implements RequestTargetConfiguration
{
    @IsValue('traineesRequestTarget')
    public readonly type = 'traineesRequestTarget';

    static readonly create = getCreate(this);
}

export const traineesRequestTarget: RequestTarget<TraineesRequestTargetConfiguration> =
    {
        configuration: TraineesRequestTargetConfiguration,
        createRequest: (
            draftState,
            requestingSimulatedRegionId,
            _configuration,
            requestedResource,
            key
        ) => {
            publishRadiogram(
                draftState,
                cloneDeepMutable(
                    ResourceRequestRadiogram.create(
                        nextUUID(draftState),
                        requestingSimulatedRegionId,
                        RadiogramUnpublishedStatus.create(),
                        requestedResource,
                        key
                    )
                )
            );
        },
    };
