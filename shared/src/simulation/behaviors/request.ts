import {
    IsInt,
    IsOptional,
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
import { terminateActivity } from '../activities/utils';
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
import type { SimulatedRegion } from '../../models/simulated-region';
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

    @Type(() => VehicleResource)
    @ValidateNested()
    public readonly promisedResources: VehicleResource = VehicleResource.create(
        {}
    );

    /**
     * @deprecated Use {@link updateInterval} instead
     * The minimum value is 15 seconds, because lower values could cause
     * duplicate requests to other regions.
     */
    @IsInt()
    @Min(1000 * 15)
    public readonly requestInterval: number = 1000 * 60 * 5;

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
            case 'resourceRequiredEvent': {
                if (event.requiringSimulatedRegionId === simulatedRegion.id) {
                    behaviorState.requestedResources[event.key] =
                        event.requiredResource;
                    syncTimerActivity(
                        draftState,
                        simulatedRegion,
                        behaviorState
                    );
                }
                break;
            }
            case 'vehiclesSentEvent': {
                behaviorState.promisedResources = aggregateResources([
                    behaviorState.promisedResources,
                    event.vehiclesSent,
                ]);
                syncTimerActivity(draftState, simulatedRegion, behaviorState);
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
                syncTimerActivity(draftState, simulatedRegion, behaviorState);
                break;
            }
            case 'sendRequestEvent': {
                const activityId = nextUUID(draftState);
                const resourcesToRequest = getResourcesToRequest(behaviorState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    CreateRequestActivityState.create(
                        activityId,
                        behaviorState.requestTarget,
                        resourcesToRequest
                    )
                );
                break;
            }
            default:
                break;
        }
    },
};

export function updateInterval(
    draftState: Mutable<ExerciseState>,
    simulatedRegionId: UUID,
    behaviorState: Mutable<RequestBehaviorState>,
    requestInterval: number
) {
    behaviorState.requestInterval = requestInterval;

    if (behaviorState.recurringEventActivityId) {
        const activity = getActivityById(
            draftState,
            simulatedRegionId,
            behaviorState.recurringEventActivityId,
            'recurringEventActivity'
        );
        activity.recurrenceIntervalTime = requestInterval;
    }
}

function syncTimerActivity(
    draftState: Mutable<ExerciseState>,
    simulatedRegion: Mutable<SimulatedRegion>,
    behaviorState: Mutable<RequestBehaviorState>
) {
    const resourcesToRequest = getResourcesToRequest(behaviorState);
    if (
        Object.keys(resourcesToRequest.vehicleCounts).length === 0 &&
        behaviorState.recurringEventActivityId
    ) {
        terminateActivity(
            draftState,
            simulatedRegion,
            behaviorState.recurringEventActivityId
        );
    }

    if (
        Object.keys(resourcesToRequest.vehicleCounts).length > 0 &&
        !behaviorState.recurringEventActivityId
    ) {
        const activityId = nextUUID(draftState);
        simulatedRegion.activities[activityId] = cloneDeepMutable(
            RecurringEventActivityState.create(
                activityId,
                SendRequestEvent.create(),
                draftState.currentTime,
                behaviorState.requestInterval
            )
        );
        behaviorState.recurringEventActivityId = activityId;
    }
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
