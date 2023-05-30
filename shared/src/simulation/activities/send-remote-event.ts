import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { getCreate } from '../../models/utils/get-create';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { ExerciseSimulationEvent, simulationEventTypeOptions } from '../events';
import { sendSimulationEvent } from '../events/utils';
import { tryGetElement } from '../../store/action-reducers/utils';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

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
