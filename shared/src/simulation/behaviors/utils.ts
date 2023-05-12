import { TransferCountsRadiogram } from '../../models/radiogram';
import type { ExerciseRadiogram } from '../../models/radiogram/exercise-radiogram';
import { MaterialCountRadiogram } from '../../models/radiogram/material-count-radiogram';
import { PatientCountRadiogram } from '../../models/radiogram/patient-count-radiogram';
import { PersonnelCountRadiogram } from '../../models/radiogram/personnel-count-radiogram';
import type { ExerciseRadiogramStatus } from '../../models/radiogram/status/exercise-radiogram-status';
import { TreatmentStatusRadiogram } from '../../models/radiogram/treatment-status-radiogram';
import { VehicleCountRadiogram } from '../../models/radiogram/vehicle-count-radiogram';
import type { UUID } from '../../utils';
import { StrictObject } from '../../utils';
import type { AllowedValues } from '../../utils/validators';

export const reportableInformationAllowedValues: AllowedValues<ReportableInformation> =
    {
        patientCount: true,
        personnelCount: true,
        vehicleCount: true,
        transferCounts: true,
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
    | 'transferCounts'
    | 'treatmentStatus'
    | 'vehicleCount';

export const createRadiogramMap: {
    [Key in ReportableInformation]: (
        id: UUID,
        simulatedRegionId: UUID,
        status: ExerciseRadiogramStatus
    ) => ExerciseRadiogram;
} = {
    patientCount: PatientCountRadiogram.create,
    personnelCount: PersonnelCountRadiogram.create,
    vehicleCount: VehicleCountRadiogram.create,
    transferCounts: TransferCountsRadiogram.create,
    treatmentStatus: TreatmentStatusRadiogram.create,
    materialCount: MaterialCountRadiogram.create,
};
