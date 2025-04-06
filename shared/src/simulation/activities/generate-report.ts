import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import type { ExerciseRadiogram } from '../../models/radiogram/exercise-radiogram.js';
import { radiogramTypeOptions } from '../../models/radiogram/exercise-radiogram.js';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable.js';
import { getCreate } from '../../models/utils/get-create.js';
import type { UUID } from '../../utils/index.js';
import { uuidValidationOptions } from '../../utils/index.js';
import { IsValue } from '../../utils/validators/index.js';
import type { ExerciseSimulationEvent } from '../events/exercise-simulation-event.js';
import { simulationEventTypeOptions } from '../events/exercise-simulation-event.js';
import { sendSimulationEvent } from '../events/utils.js';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity.js';

export class GenerateReportActivityState implements SimulationActivityState {
    @IsValue('generateReportActivity')
    readonly type = 'generateReportActivity';

    @IsUUID(4, uuidValidationOptions)
    readonly id: UUID;

    @Type(...radiogramTypeOptions)
    @ValidateNested()
    readonly radiogram: ExerciseRadiogram;

    @Type(...simulationEventTypeOptions)
    @ValidateNested()
    readonly collectEvent: ExerciseSimulationEvent;

    @IsBoolean()
    readonly hasSendEvent: boolean;

    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(
        id: UUID,
        radiogram: ExerciseRadiogram,
        collectEvent: ExerciseSimulationEvent
    ) {
        this.id = id;
        this.radiogram = radiogram;
        this.collectEvent = collectEvent;
        this.hasSendEvent = false;
    }

    static readonly create = getCreate(this);
}

export const generateReportActivity: SimulationActivity<GenerateReportActivityState> =
    {
        activityState: GenerateReportActivityState,
        tick(
            draftState,
            simulatedRegion,
            activityState,
            _tickInterval,
            terminate
        ) {
            if (!activityState.hasSendEvent) {
                sendSimulationEvent(
                    simulatedRegion,
                    activityState.collectEvent
                );
                activityState.hasSendEvent = true;
            } else {
                publishRadiogram(draftState, activityState.radiogram);
                terminate();
            }
        },
    };
