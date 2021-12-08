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
import { UUID, uuid } from './utils';

export class Exercise {
    public id = uuid();
    public viewports: Map<UUID, Viewport> = new Map();
    public vehicles: Map<UUID, Vehicle> = new Map();
    public personell: Map<UUID, Personell> = new Map();
    public patients: Map<UUID, Patient> = new Map();
    public materials: Map<UUID, Material> = new Map();
    public images: Map<UUID, Image> = new Map();
    public transferPoints: Map<UUID, TransferPoint> = new Map();
    public clients: Map<UUID, Client> = new Map();
    public patientTemplates: PatientTemplate[] = [];
    public vehicleTemplates: VehicleTemplate[] = [];
    public imageTemplates: ImageTemplate[] = [];
    public ecoLog: EocLogEntry[] = [];
    public statusHistory: StatusHistoryEntry[] = [];
}
