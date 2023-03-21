import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
import {
    ExerciseRadiogram,
    radiogramTypeOptions,
} from '../../models/radiogram/exercise-radiogram';
import { publishRadiogram } from '../../models/radiogram/radiogram-helpers-mutable';
import { getCreate } from '../../models/utils';
import { UUID, uuidValidationOptions } from '../../utils';
import { IsValue } from '../../utils/validators';
import { ExerciseSimulationEvent, simulationEventTypeOptions } from '../events';
import { sendSimulationEvent } from '../events/utils';
import type {
    SimulationActivity,
    SimulationActivityState,
} from './simulation-activity';

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
