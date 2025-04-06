import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import type { ExerciseRadiogram } from '../../models/radiogram/exercise-radiogram.js';
import { radiogramTypeOptions } from '../../models/radiogram/exercise-radiogram.js';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity.js';

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
