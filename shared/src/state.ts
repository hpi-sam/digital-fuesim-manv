import { defaultPatientTemplates } from './data/default-state/patient-templates';
import { defaultVehicleTemplates } from './data/default-state/vehicle-templates';
import type {
    Client,
    EocLogEntry,
    Image,
    ImageTemplate,
    Material,
    Patient,
    Personnel,
    StatusHistoryEntry,
    TransferPoint,
    Vehicle,
    Viewport,
} from './models';
import { getCreate } from './models/utils';
import type { UUID } from './utils';
import { uuid } from './utils';

export class ExerciseState {
    public readonly id = uuid();
    public readonly viewports: { readonly [key: UUID]: Viewport } = {};
    public readonly vehicles: { readonly [key: UUID]: Vehicle } = {};
    public readonly personnel: { readonly [key: UUID]: Personnel } = {};
    public readonly patients: { readonly [key: UUID]: Patient } = {};
    public readonly materials: { readonly [key: UUID]: Material } = {};
    public readonly images: { readonly [key: UUID]: Image } = {};
    public readonly transferPoints: { readonly [key: UUID]: TransferPoint } =
        {};
    public readonly clients: { readonly [key: UUID]: Client } = {};
    public readonly patientTemplates = defaultPatientTemplates;
    public readonly vehicleTemplates = defaultVehicleTemplates;
    public readonly imageTemplates: readonly ImageTemplate[] = [];
    public readonly ecoLog: readonly EocLogEntry[] = [];
    public readonly statusHistory: readonly StatusHistoryEntry[] = [];
    public readonly participantId: string = '';

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-useless-constructor
    constructor() {}

    static readonly create = getCreate(this);
}
