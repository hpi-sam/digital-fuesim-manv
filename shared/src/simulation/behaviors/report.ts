import { isUUID, IsUUID } from 'class-validator';
import { RadiogramUnpublishedStatus } from '../../models/radiogram/status/radiogram-unpublished-status';
import { getCreate } from '../../models/utils';
import { cloneDeepMutable, StrictObject, UUID, uuid } from '../../utils';
import { IsLiteralUnionMap, IsValue } from '../../utils/validators';
import { GenerateReportActivityState } from '../activities/generate-report';
import { CollectInformationEvent } from '../events/collect';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';
import type { ReportableInformation } from './utils';
import {
    createRadiogramMap,
    reportableInformationAllowedValues,
} from './utils';

export class ReportBehaviorState implements SimulationBehaviorState {
    @IsValue('reportBehavior')
    readonly type = 'reportBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    @IsLiteralUnionMap(reportableInformationAllowedValues, ((value) =>
        isUUID(value, 4)) as (value: unknown) => value is UUID)
    public readonly activityIds: { [key in ReportableInformation]?: UUID } = {};

    static readonly create = getCreate(this);
}

export const reportBehavior: SimulationBehavior<ReportBehaviorState> = {
    behaviorState: ReportBehaviorState,
    handleEvent: (draftState, simulatedRegion, _behaviorState, event) => {
        switch (event.type) {
            case 'startCollectingInformationEvent': {
                const activityId = nextUUID(draftState);

                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        createRadiogramMap[event.informationType](
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectInformationEvent.create(
                            activityId,
                            event.informationType
                        )
                    )
                );
                break;
            }
            default:
            // Ignore event
        }
    },
    onRemove(_draftState, simulatedRegion, behaviorState) {
        StrictObject.values(behaviorState.activityIds)
            .filter((activityId) => activityId !== undefined)
            .forEach((activityId) => {
                delete simulatedRegion.activities[activityId!];
            });
    },
};
