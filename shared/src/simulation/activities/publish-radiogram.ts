import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import {
    ExerciseRadiogram,
    radiogramTypeOptions,
} from '../../models/radiogram/exercise-radiogram';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

export class PublishRadiogramActivityState implements SimulationActivityState {
    @IsValue('publishRadiogramActivity')
    readonly type = 'publishRadiogramActivity';

    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @Type(...radiogramTypeOptions)
    @ValidateNested()
    readonly radiogram: ExerciseRadiogram;

    constructor(id: UUID, radiogram: ExerciseRadiogram) {
        this.id = id;
        this.radiogram = radiogram;
    }

    static readonly create = getCreate(this);
}

export const publishRadiogramActivity: SimulationActivity<PublishRadiogramActivityState> =
    {
        activityState: PublishRadiogramActivityState,
        tick(
            draftState,
            _simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            publishRadiogram(draftState, activityState.radiogram);
            terminate();
        },
    };
