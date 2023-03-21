import { IsOptional, IsUUID } from 'class-validator';
import { MaterialCountRadiogram } from '../../models/radiogram/material-count-radiogram';
import { PatientCountRadiogram } from '../../models/radiogram/patient-count-radiogram';
import { PersonnelCountRadiogram } from '../../models/radiogram/personnel-count-radiogram';
import { RadiogramUnpublishedStatus } from '../../models/radiogram/status/radiogram-unpublished-status';
import { TreatmentStatusRadiogram } from '../../models/radiogram/treatment-status-radiogram';
import { VehicleCountRadiogram } from '../../models/radiogram/vehicle-count-radiogram';
import { getCreate } from '../../models/utils';
import { cloneDeepMutable, UUID, uuid } from '../../utils';
import { IsValue } from '../../utils/validators';
import { GenerateReportActivityState } from '../activities/generate-report';
import { RecurringEventActivityState } from '../activities/recurring-event';
import { CollectMaterialCountEvent } from '../events/collect/collect-material-count';
import { CollectPatientCountEvent } from '../events/collect/collect-patient-count';
import { CollectPersonnelCountEvent } from '../events/collect/collect-personnel-count';
import { CollectTreatmentStatusEvent } from '../events/collect/collect-treatment-status';
import { CollectVehicleCountEvent } from '../events/collect/collect-vehicle-count';
import { StartCollectingMaterialCountEvent } from '../events/collect/start-collecting-material-count';
import { StartCollectingPatientCountEvent } from '../events/collect/start-collecting-patient-count';
import { StartCollectingPersonnelCountEvent } from '../events/collect/start-collecting-personnel-count';
import { StartCollectingTreatmentStatusEvent } from '../events/collect/start-collecting-treatment-status';
import { StartCollectingVehicleCountEvent } from '../events/collect/start-collecting-vehicle-count';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export class ReportBehaviorState implements SimulationBehaviorState {
    @IsValue('reportBehavior')
    readonly type = 'reportBehavior';

    @IsUUID()
    public readonly id: UUID = uuid();

    @IsOptional()
    @IsUUID()
    public readonly patientCountActivityId?: UUID;

    @IsOptional()
    @IsUUID()
    public readonly vehicleCountActivityId?: UUID;

    @IsOptional()
    @IsUUID()
    public readonly personnelCountActivityId?: UUID;

    @IsOptional()
    @IsUUID()
    public readonly materialCountActivityId?: UUID;

    @IsOptional()
    @IsUUID()
    public readonly treatmentProgressActivityId?: UUID;

    // TODO: SCALE

    static readonly create = getCreate(this);
}

export const reportBehavior: SimulationBehavior<ReportBehaviorState> = {
    behaviorState: ReportBehaviorState,
    handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
        switch (event.type) {
            case 'tickEvent':
                if (!behaviorState.patientCountActivityId) {
                    const activityId = nextUUID(draftState);
                    const delay = 1000 * 60 * 5; // 5 minutes

                    behaviorState.patientCountActivityId = activityId;
                    simulatedRegion.activities[activityId] = cloneDeepMutable(
                        RecurringEventActivityState.create(
                            activityId,
                            StartCollectingPatientCountEvent.create(),
                            draftState.currentTime + delay,
                            delay,
                            true
                        )
                    );
                }

                if (!behaviorState.vehicleCountActivityId) {
                    const activityId = nextUUID(draftState);
                    const delay = 1000 * 60 * 5; // 5 minutes

                    behaviorState.vehicleCountActivityId = activityId;
                    simulatedRegion.activities[activityId] = cloneDeepMutable(
                        RecurringEventActivityState.create(
                            activityId,
                            StartCollectingVehicleCountEvent.create(),
                            draftState.currentTime + delay,
                            delay,
                            true
                        )
                    );
                }

                if (!behaviorState.personnelCountActivityId) {
                    const activityId = nextUUID(draftState);
                    const delay = 1000 * 60 * 5; // 5 minutes

                    behaviorState.personnelCountActivityId = activityId;
                    simulatedRegion.activities[activityId] = cloneDeepMutable(
                        RecurringEventActivityState.create(
                            activityId,
                            StartCollectingPersonnelCountEvent.create(),
                            draftState.currentTime + delay,
                            delay,
                            true
                        )
                    );
                }

                if (!behaviorState.materialCountActivityId) {
                    const activityId = nextUUID(draftState);
                    const delay = 1000 * 60 * 5; // 5 minutes

                    behaviorState.materialCountActivityId = activityId;
                    simulatedRegion.activities[activityId] = cloneDeepMutable(
                        RecurringEventActivityState.create(
                            activityId,
                            StartCollectingMaterialCountEvent.create(),
                            draftState.currentTime + delay,
                            delay,
                            true
                        )
                    );
                }

                if (!behaviorState.treatmentProgressActivityId) {
                    const activityId = nextUUID(draftState);
                    const delay = 1000 * 60 * 5; // 5 minutes

                    behaviorState.treatmentProgressActivityId = activityId;
                    simulatedRegion.activities[activityId] = cloneDeepMutable(
                        RecurringEventActivityState.create(
                            activityId,
                            StartCollectingTreatmentStatusEvent.create(),
                            draftState.currentTime + delay,
                            delay,
                            true
                        )
                    );
                }

                break;
            case 'startCollectingPatientCountEvent': {
                const activityId = nextUUID(draftState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        PatientCountRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectPatientCountEvent.create(activityId)
                    )
                );
                break;
            }
            case 'startCollectingMaterialCountEvent': {
                const activityId = nextUUID(draftState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        MaterialCountRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectMaterialCountEvent.create(activityId)
                    )
                );
                break;
            }
            case 'startCollectingVehicleCountEvent': {
                const activityId = nextUUID(draftState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        VehicleCountRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectVehicleCountEvent.create(activityId)
                    )
                );
                break;
            }
            case 'startCollectingPersonnelCountEvent': {
                const activityId = nextUUID(draftState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        PersonnelCountRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectPersonnelCountEvent.create(activityId)
                    )
                );
                break;
            }
            case 'startCollectingTreatmentStatusEvent': {
                const activityId = nextUUID(draftState);
                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        TreatmentStatusRadiogram.create(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        CollectTreatmentStatusEvent.create(activityId)
                    )
                );
                break;
            }
            default:
            // Ignore event
        }
    },
};
