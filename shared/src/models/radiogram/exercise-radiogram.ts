import type { Type } from 'class-transformer';
import type { Constructor } from '../../utils';
import { MaterialCountRadiogram } from './material-count-radiogram';
import { MissingTransferConnectionRadiogram } from './missing-transfer-connection-radiogram';
import { PatientCountRadiogram } from './patient-count-radiogram';
import { PersonnelCountRadiogram } from './personnel-count-radiogram';
import { Radiogram } from './radiogram';
import { TreatmentStatusRadiogram } from './treatment-status-radiogram';
import { VehicleCountRadiogram } from './vehicle-count-radiogram';
import { ResourceRequestRadiogram } from './resource-request-radiogram';
import { TransferCountsRadiogram } from './transfer-counts-radiogram';
import { TransferCategoryCompletedRadiogram } from './transfer-category-completed-radiogram';

export const radiograms = {
    MaterialCountRadiogram,
    MissingTransferConnectionRadiogram,
    PatientCountRadiogram,
    PersonnelCountRadiogram,
    ResourceRequestRadiogram,
    TransferCategoryCompletedRadiogram,
    TransferCountsRadiogram,
    TreatmentStatusRadiogram,
    VehicleCountRadiogram,
};

export type ExerciseRadiogram = InstanceType<
    (typeof radiograms)[keyof typeof radiograms]
>;

type ExerciseRadiogramDictionary = {
    [Radiogram in ExerciseRadiogram as Radiogram['type']]: Constructor<Radiogram>;
};

export const radiogramDictionary: ExerciseRadiogramDictionary = {
    materialCountRadiogram: MaterialCountRadiogram,
    missingTransferConnectionRadiogram: MissingTransferConnectionRadiogram,
    patientCountRadiogram: PatientCountRadiogram,
    personnelCountRadiogram: PersonnelCountRadiogram,
    resourceRequestRadiogram: ResourceRequestRadiogram,
    transferCategoryCompletedRadiogram: TransferCategoryCompletedRadiogram,
    transferCountsRadiogram: TransferCountsRadiogram,
    treatmentStatusRadiogram: TreatmentStatusRadiogram,
    vehicleCountRadiogram: VehicleCountRadiogram,
};

export function getRadiogramConstructor(radiogram: ExerciseRadiogram) {
    return radiogramDictionary[radiogram.type];
}

export const radiogramTypeOptions: Parameters<typeof Type> = [
    () => Radiogram,
    {
        keepDiscriminatorProperty: true,
        discriminator: {
            property: 'type',
            subTypes: Object.entries(radiogramDictionary).map(
                ([name, value]) => ({ name, value })
            ),
        },
    },
];
