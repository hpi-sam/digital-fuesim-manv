import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { ExerciseSimulationEvent } from '../events/index.js';
import { simulationEventTypeOptions } from '../events/index.js';
import { sendSimulationEvent } from '../events/utils.js';
import { tryGetElement } from '../../store/action-reducers/utils/index.js';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity.js';

export class SendRemoteEventActivityState implements SimulationActivityState {
    @IsValue('sendRemoteEventActivity' as const)
    public readonly type = 'sendRemoteEventActivity';

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID;

    @IsUUID(4, uuidValidationOptions)
    public readonly targetSimulatedRegionId: UUID;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    public readonly event: ExerciseSimulationEvent;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        id: UUID,
        targetSimulatedRegionId: UUID,
        event: ExerciseSimulationEvent
    ) {
        this.id = id;
        this.targetSimulatedRegionId = targetSimulatedRegionId;
        this.event = event;
    }

    static readonly create = getCreate(this);
}

export const sendRemoteEventActivity: SimulationActivity<SendRemoteEventActivityState> =
    {
        activityState: SendRemoteEventActivityState,
        tick(
            draftState,
            _simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            const targetSimulatedRegion = tryGetElement(
                draftState,
                'simulatedRegion',
                activityState.targetSimulatedRegionId
            );
            if (targetSimulatedRegion) {
                sendSimulationEvent(targetSimulatedRegion, activityState.event);
            }
            terminate();
        },
    };
