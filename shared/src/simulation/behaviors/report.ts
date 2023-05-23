import { IsBoolean, isUUID, IsUUID } from 'class-validator';
import { RadiogramUnpublishedStatus } from '../../models/radiogram/status/radiogram-unpublished-status';
import { getCreate } from '../../models/utils';
import {
    cloneDeepMutable,
    StrictObject,
    UUID,
    uuid,
    uuidValidationOptions,
} from '../../utils';
import { IsLiteralUnionMap, IsValue } from '../../utils/validators';
import { GenerateReportActivityState } from '../activities/generate-report';
import { CollectInformationEvent } from '../events/collect';
import { nextUUID } from '../utils/randomness';
import {
    TransferCategoryCompletedRadiogram,
    TreatmentStatusRadiogram,
} from '../../models/radiogram';
import { addActivity } from '../activities/utils';
import { PublishRadiogramActivityState } from '../activities';
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

    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsLiteralUnionMap(reportableInformationAllowedValues, ((value) =>
        isUUID(value, 4)) as (value: unknown) => value is UUID)
    public readonly activityIds: { [key in ReportableInformation]?: UUID } = {};

    @IsBoolean()
    public readonly reportTreatmentProgressChanges: boolean = true;

    @IsBoolean()
    public readonly reportTransferOfCategoryInSingleRegionCompleted: boolean =
        false;

    @IsBoolean()
    public readonly reportTransferOfCategoryInMultipleRegionsCompleted: boolean =
        true;

    static readonly create = getCreate(this);
}

export const reportBehavior: SimulationBehavior<ReportBehaviorState> = {
    behaviorState: ReportBehaviorState,
    handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
        switch (event.type) {
            case 'startCollectingInformationEvent': {
                const activityId = nextUUID(draftState);

                addActivity(
                    simulatedRegion,
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
            case 'treatmentProgressChangedEvent': {
                if (!behaviorState.reportTreatmentProgressChanges) return;

                if (event.newProgress === 'noTreatment') {
                    // No treatment indicates that there is no leader
                    // Therefore, the radiogram can't be sent
                    return;
                }

                const radiogram = cloneDeepMutable(
                    TreatmentStatusRadiogram.create(
                        nextUUID(draftState),
                        simulatedRegion.id,
                        RadiogramUnpublishedStatus.create()
                    )
                );
                radiogram.treatmentStatus = event.newProgress;
                radiogram.treatmentStatusChanged = true;
                radiogram.informationAvailable = true;

                addActivity(
                    simulatedRegion,
                    PublishRadiogramActivityState.create(
                        nextUUID(draftState),
                        radiogram
                    )
                );
                break;
            }
            case 'patientCategoryTransferToHospitalFinishedEvent': {
                if (
                    (event.isRelatedOnlyToOwnRegion &&
                        behaviorState.reportTransferOfCategoryInSingleRegionCompleted) ||
                    (!event.isRelatedOnlyToOwnRegion &&
                        behaviorState.reportTransferOfCategoryInMultipleRegionsCompleted)
                ) {
                    const radiogram = cloneDeepMutable(
                        TransferCategoryCompletedRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        )
                    );
                    radiogram.completedCategory = event.patientCategory;
                    radiogram.scope = event.isRelatedOnlyToOwnRegion
                        ? 'singleRegion'
                        : 'transportManagement';
                    radiogram.informationAvailable = true;

                    addActivity(
                        simulatedRegion,
                        PublishRadiogramActivityState.create(
                            nextUUID(draftState),
                            radiogram
                        )
                    );
                }

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
