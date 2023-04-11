import {
    IsArray,
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
import { addActivity } from '../activities/utils';
import { nextUUID } from '../utils/randomness';
import { RecurringEventActivityState } from '../activities';
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
import { ResourcePromise } from '../utils/resource-promise';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class RequestBehaviorState implements SimulationBehaviorState {
    @IsValue('requestBehavior')
    readonly type = 'requestBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    /**
     * @deprecated Use {@link isWaitingForAnswer} instead
     */
    @IsString()
    @IsOptional()
    public readonly answerKey?: string;

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
    /**
     * @deprecated Use {@link updateBehaviorsRequestTarget} instead
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
                if (event.requiringSimulatedRegionId === simulatedRegion.id) {
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

                if (event.key === behaviorState.answerKey) {
                    behaviorState.answerKey = undefined;
                }
                break;
            }
            case 'vehicleArrivedEvent': {
                const vehicle = getElement(
                    draftState,
                    'vehicle',
                    event.vehicleId
                );
                let arrivatedResource = cloneDeepMutable(
                    VehicleResource.create({ [vehicle.vehicleType]: 1 })
                );
                behaviorState.promisedResources.forEach((promise) => {
                    const remainingResources = subtractResources(
                        arrivatedResource,
                        promise.resource
                    );

                    promise.resource = subtractResources(
                        promise.resource,
                        arrivatedResource
                    );

                    arrivatedResource = remainingResources;
                });
                behaviorState.promisedResources =
                    behaviorState.promisedResources.filter(
                        (promise) =>
                            Object.keys(promise.resource.vehicleCounts).length >
                            0
                    );
                break;
            }
            case 'sendRequestEvent': {
                if (!isWaitingForAnswer(behaviorState)) {
                    const resourcesToRequest = getResourcesToRequest(
                        draftState,
                        simulatedRegion,
                        behaviorState
                    );
                    if (
                        Object.keys(resourcesToRequest.vehicleCounts).length > 0
                    ) {
                        // create a request to wait for an answer
                        behaviorState.answerKey = `${simulatedRegion.id}-request-${behaviorState.requestTargetVersion}`;
                        const activityId = nextUUID(draftState);
                        addActivity(
                            simulatedRegion,
                            CreateRequestActivityState.create(
                                activityId,
                                behaviorState.requestTarget,
                                resourcesToRequest,
                                behaviorState.answerKey
                            )
                        );
                    }
                }
                break;
            }
            default:
                break;
        }
    },
};

export function isWaitingForAnswer(behaviorState: RequestBehaviorState) {
    return behaviorState.answerKey !== undefined;
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

export function updateBehaviorsRequestTarget(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>,
    requestTarget: ExerciseRequestTargetConfiguration
) {
    behaviorState.requestTarget = cloneDeepMutable(requestTarget);
    behaviorState.requestTargetVersion++;

    if (isWaitingForAnswer(behaviorState)) {
        behaviorState.answerKey = undefined;
    }
}

export function getResourcesToRequest(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>
) {
    const requestedResources = aggregateResources(
        Object.values(behaviorState.requestedResources)
    );

    // remove invalidated resources
    let firstValidIndex: number | undefined =
        behaviorState.promisedResources.findIndex(
            (promise) =>
                promise.promisedTime + behaviorState.invalidatePromiseInterval >
                draftState.currentTime
        );
    if (firstValidIndex === -1)
        firstValidIndex = behaviorState.promisedResources.length;
    behaviorState.promisedResources.splice(0, firstValidIndex);

    const promisedResources = aggregateResources(
        behaviorState.promisedResources.map((promise) => promise.resource)
    );
    return subtractResources(requestedResources, promisedResources);
}
