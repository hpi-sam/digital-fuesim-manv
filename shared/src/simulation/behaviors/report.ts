import { isUUID, IsUUID } from 'class-validator';
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
import type { AllowedValues } from '../../utils/validators';
import { IsLiteralUnionMap, IsValue } from '../../utils/validators';
import { GenerateReportActivityState } from '../activities/generate-report';
import { CollectInformationEvent } from '../events/collect';
import { nextUUID } from '../utils/randomness';
import type {
    SimulationBehavior,
    SimulationBehaviorState,
} from './simulation-behavior';

export const reportableInformationAllowedValues: AllowedValues<ReportableInformation> =
    {
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
    | 'materialCount'
    | 'patientCount'
    | 'personnelCount'
    | 'treatmentStatus'
    | 'vehicleCount';

export const createRadiogramMap: {
    [key in ReportableInformation]: (
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus
    ) => ExerciseRadiogram;
} = {
    patientCount: PatientCountRadiogram.create,
    personnelCount: PersonnelCountRadiogram.create,
    vehicleCount: VehicleCountRadiogram.create,
    treatmentStatus: TreatmentStatusRadiogram.create,
    materialCount: MaterialCountRadiogram.create,
};

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
};
