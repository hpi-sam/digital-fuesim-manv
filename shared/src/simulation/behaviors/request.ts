import {
    IsArray,
    IsInt,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsStringMap } from '../../utils/validators/is-string-map';
import { cloneDeepMutable, StrictObject, uuid, UUID } from '../../utils';
import type { Mutable } from '../../utils';
import { IsValue } from '../../utils/validators';
import {
    getActivityById,
    tryGetElement,
} from '../../store/action-reducers/utils';
import type { ExerciseState } from '../../state';
import { addActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { RecurringEventActivityState } from '../activities';
import { SendRequestEvent } from '../events/send-request';
import { CreateRequestActivityState } from '../activities/create-request';
import { VehicleResource } from '../../models/utils/rescue-resource';
import {
    ExerciseRequestTargetConfiguration,
    requestTargetTypeOptions,
} from '../../models/utils/request-target/exercise-request-target';
import { TraineesRequestTargetConfiguration } from '../../models/utils/request-target/trainees';
import { getCreate } from '../../models/utils/get-create';
import type { SimulatedRegion } from '../../models';
import { ResourcePromise } from '../utils/resource-promise';
import type { ResourceDescription } from '../../models/utils/resource-description';
import {
    addPartialResourceDescriptions,
    subtractPartialResourceDescriptions,
} from '../../models/utils/resource-description';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class RequestBehaviorState implements SimulationBehaviorState {
    @IsValue('requestBehavior')
    readonly type = 'requestBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    @IsUUID()
    @IsOptional()
    public readonly recurringEventActivityId?: UUID;

    @IsStringMap(VehicleResource)
    public readonly requestedResources: { [key: string]: VehicleResource } = {};

    @IsArray()
    @Type(() => ResourcePromise)
    @ValidateNested({ each: true })
    public readonly promisedResources: readonly ResourcePromise[] = [];

    /**
     * @deprecated Use {@link updateBehaviorsRequestInterval} instead
     */
    @IsInt()
    @Min(0)
    public readonly requestInterval: number = 1000 * 60 * 5;

    @IsInt()
    @Min(0)
    public readonly invalidatePromiseInterval: number = 1000 * 60 * 30;

    @Type(...requestTargetTypeOptions)
    @ValidateNested()
    public readonly requestTarget: ExerciseRequestTargetConfiguration =
        TraineesRequestTargetConfiguration.create();

    static readonly create = getCreate(this);
}

export const requestBehavior: SimulationBehavior<RequestBehaviorState> = {
    behaviorState: RequestBehaviorState,
    handleEvent(draftState, simulatedRegion, behaviorState, event) {
        switch (event.type) {
            case 'tickEvent': {
                if (!behaviorState.recurringEventActivityId) {
                    behaviorState.recurringEventActivityId =
                        nextUUID(draftState);
                    addActivity(
                        simulatedRegion,
                        RecurringEventActivityState.create(
                            behaviorState.recurringEventActivityId,
                            SendRequestEvent.create(),
                            draftState.currentTime,
                            behaviorState.requestInterval
                        )
                    );
                }
                break;
            }
            case 'resourceRequiredEvent': {
                if (
                    event.requiringSimulatedRegionId === simulatedRegion.id &&
                    event.requiredResource.type === 'vehicleResource'
                ) {
                    behaviorState.requestedResources[event.key] =
                        event.requiredResource;
                }
                break;
            }
            case 'vehiclesSentEvent': {
                behaviorState.promisedResources.push(
                    cloneDeepMutable(
                        ResourcePromise.create(
                            draftState.currentTime,
                            event.vehiclesSent
                        )
                    )
                );
                break;
            }
            case 'vehicleArrivedEvent': {
                const vehicle = tryGetElement(
                    draftState,
                    'vehicle',
                    event.vehicleId
                );
                if (vehicle === undefined) {
                    break;
                }
                let arrivedResourceDescription: Partial<ResourceDescription> = {
                    [vehicle.vehicleType]: 1,
                };
                behaviorState.promisedResources.forEach((promise) => {
                    const remainingResources =
                        subtractPartialResourceDescriptions(
                            arrivedResourceDescription,
                            promise.resource.vehicleCounts
                        );

                    promise.resource.vehicleCounts =
                        subtractPartialResourceDescriptions(
                            promise.resource.vehicleCounts,
                            arrivedResourceDescription
                        ) as ResourceDescription;

                    arrivedResourceDescription = remainingResources;
                });
                behaviorState.promisedResources =
                    behaviorState.promisedResources.filter(
                        (promise) =>
                            Object.keys(promise.resource.vehicleCounts).length >
                            0
                    );

                behaviorState.requestedResources = {};
                break;
            }
            case 'sendRequestEvent': {
                const resourcesToRequest = getResourcesToRequest(
                    draftState,
                    behaviorState
                );
                const resource = VehicleResource.create(
                    resourcesToRequest as ResourceDescription
                );
                addActivity(
                    simulatedRegion,
                    CreateRequestActivityState.create(
                        nextUUID(draftState),
                        behaviorState.requestTarget,
                        resource,
                        requestBehaviorKey(simulatedRegion)
                    )
                );
                break;
            }
            default:
                break;
        }
    },
    onRemove(draftState, simulatedRegion, behaviorState) {
        addActivity(
            simulatedRegion,
            CreateRequestActivityState.create(
                nextUUID(draftState),
                behaviorState.requestTarget,
                VehicleResource.create({}),
                requestBehaviorKey(simulatedRegion)
            )
        );
    },
};

function requestBehaviorKey(simulatedRegion: Mutable<SimulatedRegion>) {
    return `${simulatedRegion.id}-request`;
}

export function updateBehaviorsRequestTarget(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>,
    requestTarget: ExerciseRequestTargetConfiguration
) {
    addActivity(
        simulatedRegion,
        CreateRequestActivityState.create(
            nextUUID(draftState),
            behaviorState.requestTarget,
            VehicleResource.create({}),
            requestBehaviorKey(simulatedRegion)
        )
    );
    behaviorState.requestTarget = cloneDeepMutable(requestTarget);
}

export function updateBehaviorsRequestInterval(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>,
    requestInterval: number
) {
    if (behaviorState.recurringEventActivityId) {
        const activity = getActivityById(
            draftState,
            simulatedRegion.id,
            behaviorState.recurringEventActivityId,
            'recurringEventActivity'
        );
        activity.recurrenceIntervalTime = requestInterval;
    }
    behaviorState.requestInterval = requestInterval;
}

export function getResourcesToRequest(
    draftState: Mutable<ExerciseState>,
    behaviorState: Mutable<RequestBehaviorState>
) {
    const requestedResources = addPartialResourceDescriptions(
        StrictObject.values(behaviorState.requestedResources).map(
            (resource) => resource.vehicleCounts
        )
    );

    // remove invalidated resources
    let firstValidIndex = behaviorState.promisedResources.findIndex(
        (promise) =>
            promise.promisedTime + behaviorState.invalidatePromiseInterval >
            draftState.currentTime
    );
    if (firstValidIndex === -1)
        firstValidIndex = behaviorState.promisedResources.length;
    behaviorState.promisedResources.splice(0, firstValidIndex);

    const promisedResources = addPartialResourceDescriptions(
        behaviorState.promisedResources.map(
            (promise) => promise.resource.vehicleCounts
        )
    );
    return subtractPartialResourceDescriptions(
        requestedResources,
        promisedResources
    );
}
