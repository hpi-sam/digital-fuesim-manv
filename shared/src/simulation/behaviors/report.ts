import { IsOptional, IsUUID } from 'class-validator';
import type { ExerciseRadiogram } from '../../models/radiogram/exercise-radiogram';
import { MaterialCountRadiogram } from '../../models/radiogram/material-count-radiogram';
import { PatientCountRadiogram } from '../../models/radiogram/patient-count-radiogram';
import { PersonnelCountRadiogram } from '../../models/radiogram/personnel-count-radiogram';
import type { ExerciseRadiogramStatus } from '../../models/radiogram/status/exercise-radiogram-status';
import { RadiogramUnpublishedStatus } from '../../models/radiogram/status/radiogram-unpublished-status';
import { TreatmentStatusRadiogram } from '../../models/radiogram/treatment-status-radiogram';
import { VehicleCountRadiogram } from '../../models/radiogram/vehicle-count-radiogram';
import { getCreate } from '../../models/utils';
import { cloneDeepMutable, StrictObject, UUID, uuid } from '../../utils';
import { IsValue } from '../../utils/validators';
import { GenerateReportActivityState } from '../activities/generate-report';
import { RecurringEventActivityState } from '../activities/recurring-event';
import type { ExerciseSimulationEvent } from '../events';
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

export const reportableInformationAllowedValues = {
    patientCount: true,
    personnelCount: true,
    vehicleCount: true,
    treatmentStatus: true,
    materialCount: true,
};

export const reportableInformations = StrictObject.keys(
    reportableInformationAllowedValues
);

export type ReportableInformation =
    keyof typeof reportableInformationAllowedValues;

const createReminderEventMap: {
    [key in ReportableInformation]: () => ExerciseSimulationEvent;
} = {
    patientCount: StartCollectingPatientCountEvent.create,
    personnelCount: StartCollectingPersonnelCountEvent.create,
    vehicleCount: StartCollectingVehicleCountEvent.create,
    treatmentStatus: StartCollectingTreatmentStatusEvent.create,
    materialCount: StartCollectingMaterialCountEvent.create,
};

const createRadiogramAndEventMap: {
    [key in ExerciseSimulationEvent['type'] &
        `${string}StartCollectingEvent`]: [
        (
            id: UUID,
            simulatedRegionId: UUID,
            status: ExerciseRadiogramStatus
        ) => ExerciseRadiogram,
        (generateReportActivityId: UUID) => ExerciseSimulationEvent
    ];
} = {
    patientCountStartCollectingEvent: [
        PatientCountRadiogram.create,
        CollectPatientCountEvent.create,
    ],
    personnelCountStartCollectingEvent: [
        PersonnelCountRadiogram.create,
        CollectPersonnelCountEvent.create,
    ],
    vehicleCountStartCollectingEvent: [
        VehicleCountRadiogram.create,
        CollectVehicleCountEvent.create,
    ],
    treatmentStatusStartCollectingEvent: [
        TreatmentStatusRadiogram.create,
        CollectTreatmentStatusEvent.create,
    ],
    materialCountStartCollectingEvent: [
        MaterialCountRadiogram.create,
        CollectMaterialCountEvent.create,
    ],
};

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
    public readonly treatmentStatusActivityId?: UUID;

    static readonly create = getCreate(this);
}

export const reportBehavior: SimulationBehavior<ReportBehaviorState> = {
    behaviorState: ReportBehaviorState,
    handleEvent: (draftState, simulatedRegion, behaviorState, event) => {
        switch (event.type) {
            case 'tickEvent': {
                const defaultDelay = 1000 * 60 * 5; // 5 minutes
                StrictObject.entries(createReminderEventMap).forEach(
                    ([reportableInformation, createEvent]) => {
                        if (
                            !behaviorState[`${reportableInformation}ActivityId`]
                        ) {
                            const activityId = nextUUID(draftState);

                            behaviorState[
                                `${reportableInformation}ActivityId`
                            ] = activityId;
                            simulatedRegion.activities[activityId] =
                                cloneDeepMutable(
                                    RecurringEventActivityState.create(
                                        activityId,
                                        createEvent(),
                                        draftState.currentTime + defaultDelay,
                                        defaultDelay,
                                        true
                                    )
                                );
                        }
                    }
                );

                break;
            }
            case 'materialCountStartCollectingEvent':
            case 'patientCountStartCollectingEvent':
            case 'personnelCountStartCollectingEvent':
            case 'treatmentStatusStartCollectingEvent':
            case 'vehicleCountStartCollectingEvent': {
                const activityId = nextUUID(draftState);
                const [createRadiogram, createEvent] =
                    createRadiogramAndEventMap[event.type];

                simulatedRegion.activities[activityId] = cloneDeepMutable(
                    GenerateReportActivityState.create(
                        activityId,
                        createRadiogram(
                            nextUUID(draftState),
                            simulatedRegion.id,
                            RadiogramUnpublishedStatus.create()
                        ),
                        createEvent(activityId)
                    )
                );
                break;
            }
            default:
            // Ignore event
        }
    },
};
