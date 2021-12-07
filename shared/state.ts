import {
    Client,
    EocLogEntry,
    Image,
    ImageTemplate,
    Material,
    Patient,
    PatientTemplate,
    Personell,
    StatusHistoryEntry,
    TransferPoint,
    Vehicle,
    VehicleTemplate,
    Viewport,
} from './models';
import { UUID } from './utils';

export class ExerciseState {
    viewport: Map<UUID, Viewport>;
    vehicles: Map<UUID, Vehicle>;
    personell: Map<UUID, Personell>;
    patients: Map<UUID, Patient>;
    material: Map<UUID, Material>;
    images: Map<UUID, Image>;
    transferPoints: Map<UUID, TransferPoint>;
    clients: Map<UUID, Client>;
    patientTemplates: PatientTemplate[];
    vehicleTemplates: VehicleTemplate[];
    imageTemplates: ImageTemplate[];
    ecoLog: EocLogEntry[];
    statusHistory: StatusHistoryEntry[];
}
