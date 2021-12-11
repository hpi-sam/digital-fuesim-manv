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

// TODO: This is a workaround, because else the following error is thrown when using produce():
// `[Immer] produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'.Got '[object Object]'`
// (I have no idea why...)
export const generateExercise = (): Exercise => {
    return { ...new Exercise() };
};

export class Exercise {
    public id = uuid();
    public viewports: Record<UUID, Viewport> = {};
    public vehicles: Record<UUID, Vehicle> = {};
    public personell: Record<UUID, Personell> = {};
    public patients: Record<UUID, Patient> = {};
    public materials: Record<UUID, Material> = {};
    public images: Record<UUID, Image> = {};
    public transferPoints: Record<UUID, TransferPoint> = {};
    public clients: Record<UUID, Client> = {};
    public patientTemplates: PatientTemplate[] = [];
    public vehicleTemplates: VehicleTemplate[] = [];
    public imageTemplates: ImageTemplate[] = [];
    public ecoLog: EocLogEntry[] = [];
    public statusHistory: StatusHistoryEntry[] = [];
}
