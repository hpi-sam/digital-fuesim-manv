import {
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsStringMap } from '../../utils/validators/is-string-map';
import { cloneDeepMutable, uuid, UUID } from '../../utils';
import type { Mutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import { getActivityById, getElement } from '../../store/action-reducers/utils';
import type { ExerciseState } from '../../state';
import { addActivity, terminateActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { DelayEventActivityState } from '../activities';
import { SendRequestEvent } from '../events/send-request';
import { CreateRequestActivityState } from '../activities/create-request';
import {
    VehicleResource,
    aggregateResources,
    subtractResources,
} from '../../models/utils/vehicle-resource';
import {
    ExerciseRequestTargetConfiguration,
    requestTargetTypeOptions,
} from '../../models/utils/request-target/exercise-request-target';
import { TraineesRequestTargetConfiguration } from '../../models/utils/request-target/trainees';
import { getCreate } from '../../models/utils/get-create';
import type { SimulatedRegion } from '../../models';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class RequestBehaviorState implements SimulationBehaviorState {
    @IsValue('requestBehavior')
    readonly type = 'requestBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    @IsString()
    @IsOptional()
    public readonly answerKey?: string;

    @IsUUID()
    @IsOptional()
    public readonly delayEventActivityId?: UUID;

    @IsStringMap(VehicleResource)
    public readonly requestedResources: { [key: string]: VehicleResource } = {};

    @Type(() => VehicleResource)
    @ValidateNested()
    public readonly promisedResources: VehicleResource = VehicleResource.create(
        {}
    );

    /**
     * @deprecated Use {@link updateInterval} instead
     */
    @IsInt()
    @Min(0)
    public readonly requestInterval: number = 1000 * 60 * 5;

    /**
     * @deprecated Use {@link updateTarget} instead
     */
    @Type(...requestTargetTypeOptions)
    @ValidateNested()
    public readonly requestTarget: ExerciseRequestTargetConfiguration =
        TraineesRequestTargetConfiguration.create();

    @IsInt()
    @Min(0)
    public readonly requestTargetVersion: number = 0;

    static readonly create = getCreate(this);
}

export const requestBehavior: SimulationBehavior<RequestBehaviorState> = {
    behaviorState: RequestBehaviorState,
    handleEvent(draftState, simulatedRegion, behaviorState, event) {
        switch (event.type) {
            case 'resourceRequiredEvent': {
                if (event.requiringSimulatedRegionId === simulatedRegion.id) {
                    behaviorState.requestedResources[event.key] =
                        event.requiredResource;

                    if (!behaviorState.answerKey) {
                        behaviorState.answerKey = `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`;
                        behaviorState.delayEventActivityId =
                            nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            DelayEventActivityState.create(
                                behaviorState.delayEventActivityId,
                                SendRequestEvent.create(
                                    behaviorState.answerKey
                                ),
                                0
                            )
                        );
                    }
                }
                break;
            }
            case 'vehiclesSentEvent': {
                behaviorState.promisedResources = aggregateResources([
                    behaviorState.promisedResources,
                    event.vehiclesSent,
                ]);

                if (event.key === behaviorState.answerKey) {
                    behaviorState.delayEventActivityId = nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        DelayEventActivityState.create(
                            behaviorState.delayEventActivityId,
                            SendRequestEvent.create(behaviorState.answerKey),
                            behaviorState.requestInterval
                        )
                    );
                }
                break;
            }
            case 'vehicleArrivedEvent': {
                const vehicle = getElement(
                    draftState,
                    'vehicle',
                    event.vehicleId
                );
                behaviorState.promisedResources = subtractResources(
                    behaviorState.promisedResources,
                    cloneDeepMutable(
                        VehicleResource.create({ [vehicle.type]: 1 })
                    )
                );
                break;
            }
            case 'sendRequestEvent': {
                const resourcecsToRequest =
                    getResourcesToRequest(behaviorState);
                if (
                    Object.keys(
                        getResourcesToRequest(behaviorState).vehicleCounts
                    ).length > 0
                ) {
                    const activityId = nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        CreateRequestActivityState.create(
                            activityId,
                            behaviorState.requestTarget,
                            resourcecsToRequest,
                            event.key
                        )
                    );
                } else {
                    /**
                     * We are not requesting more resouces,
                     * so we are not waiting for a response.
                     */
                    behaviorState.answerKey = undefined;
                }
                break;
            }
            default:
                break;
        }
    },
};

export function updateInterval(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>,
    requestInterval: number
) {
    if (behaviorState.delayEventActivityId) {
        const activity = getActivityById(
            draftState,
            simulatedRegion.id,
            behaviorState.delayEventActivityId,
            'delayEventActivity'
        );
        activity.endTime -= behaviorState.requestInterval;
        activity.endTime += requestInterval;
    }
    behaviorState.requestInterval = requestInterval;
}

export function updateTarget(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>,
    requestTarget: ExerciseRequestTargetConfiguration
) {
    behaviorState.requestTarget = cloneDeepMutable(requestTarget);
    behaviorState.requestTargetVersion++;
    behaviorState.answerKey = `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`;
    if (behaviorState.delayEventActivityId) {
        terminateActivity(
            draftState,
            simulatedRegion,
            behaviorState.delayEventActivityId
        );
    }

    behaviorState.delayEventActivityId = nextUUID(draftState);
    addActivity(
        simulatedRegion,
        DelayEventActivityState.create(
            behaviorState.delayEventActivityId,
            SendRequestEvent.create(behaviorState.answerKey),
            0
        )
    );
}

function getResourcesToRequest(behaviorState: Mutable<RequestBehaviorState>) {
    const requestedResources = aggregateResources(
        Object.values(behaviorState.requestedResources)
    );
    return subtractResources(
        requestedResources,
        behaviorState.promisedResources
    );
}
