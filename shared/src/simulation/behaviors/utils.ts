import { TransferCountsRadiogram } from '../../models/radiogram/index.js';
import type { ExerciseRadiogram } from '../../models/radiogram/exercise-radiogram.js';
import { MaterialCountRadiogram } from '../../models/radiogram/material-count-radiogram.js';
import { PatientCountRadiogram } from '../../models/radiogram/patient-count-radiogram.js';
import { PersonnelCountRadiogram } from '../../models/radiogram/personnel-count-radiogram.js';
import type { ExerciseRadiogramStatus } from '../../models/radiogram/status/exercise-radiogram-status.js';
import { TreatmentStatusRadiogram } from '../../models/radiogram/treatment-status-radiogram.js';
import { VehicleCountRadiogram } from '../../models/radiogram/vehicle-count-radiogram.js';
import type { UUID } from '../../utils/index.js';
import { StrictObject } from '../../utils/index.js';
import type { AllowedValues } from '../../utils/validators/index.js';
import type { ExerciseSimulationBehaviorType } from './exercise-simulation-behavior.js';

export const reportableInformationAllowedValues: AllowedValues<ReportableInformation> =
    {
        patientCount: true,
        personnelCount: true,
        vehicleCount: true,
        singleRegionTransferCounts: true,
        transportManagementTransferCounts: true,
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
    | 'singleRegionTransferCounts'
    | 'transportManagementTransferCounts'
    | 'treatmentStatus'
    | 'vehicleCount';

export const createRadiogramMap: {
    [Key in ReportableInformation]: (
        id: UUID,
        simulatedRegionId: UUID,
        key: string | null,
        status: ExerciseRadiogramStatus
    ) => ExerciseRadiogram;
} = {
    patientCount: PatientCountRadiogram.create,
    personnelCount: PersonnelCountRadiogram.create,
    vehicleCount: VehicleCountRadiogram.create,
    singleRegionTransferCounts: TransferCountsRadiogram.create,
    transportManagementTransferCounts: TransferCountsRadiogram.create,
    treatmentStatus: TreatmentStatusRadiogram.create,
    materialCount: MaterialCountRadiogram.create,
};

export const behaviorTypeToGermanNameDictionary: {
    [Key in ExerciseSimulationBehaviorType]: string;
} = {
    assignLeaderBehavior: 'Führung zuweisen',
    treatPatientsBehavior: 'Patienten behandeln',
    unloadArrivingVehiclesBehavior: 'Fahrzeuge entladen',
    reportBehavior: 'Berichte erstellen',
    providePersonnelBehavior: 'Personal nachfordern',
    answerRequestsBehavior: 'Fahrzeuganfragen beantworten',
    automaticallyDistributeVehiclesBehavior: 'Fahrzeuge verteilen',
    requestBehavior: 'Fahrzeuge anfordern',
    transferBehavior: 'Fahrzeuge versenden',
    transferToHospitalBehavior: 'Patienten abtransportieren',
    managePatientTransportToHospitalBehavior: 'Transportorganisation',
};

export const reportableInformationTypeToGermanNameDictionary: {
    [Key in ReportableInformation]: string;
} = {
    patientCount: 'Anzahl an Patienten',
    vehicleCount: 'Anzahl an Fahrzeugen',
    personnelCount: 'Anzahl an Rettungskräften',
    materialCount: 'Anzahl an Material',
    treatmentStatus: 'Behandlungsstatus',
    singleRegionTransferCounts:
        'Anzahl aus diesem Bereich in Krankenhäuser abtransportierter Patienten',
    transportManagementTransferCounts:
        'Anzahl unter dieser Transportorganisation in Krankenhäuser abtransportierter Patienten',
};
