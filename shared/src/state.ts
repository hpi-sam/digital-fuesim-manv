import { defaultMapImagesTemplates } from './data/default-state/map-images-templates';
import { defaultPatientCategories } from './data/default-state/patient-templates';
import { defaultVehicleTemplates } from './data/default-state/vehicle-templates';
import type {
    AlarmGroup,
    Client,
    EocLogEntry,
    Hospital,
    HospitalPatient,
    MapImage,
    Material,
    Patient,
    Personnel,
    StatusHistoryEntry,
    TransferPoint,
    Vehicle,
    Viewport,
} from './models';
import { ExerciseConfiguration } from './models/exercise-configuration';
import type { StatisticsEntry } from './models/statistics-entry';
import { getCreate } from './models/utils';
import type { UUID } from './utils';
import { uuid } from './utils';

export class ExerciseState {
    public readonly id = uuid();
    /**
     * The number of ms since the start of the exercise.
     * This time is updated each `tick` by a constant value, is guaranteed to be (a bit) slower than the real time
     * (depending on the server load and overhead of the tick).
     */
    public readonly currentTime = 0;
    public readonly viewports: { readonly [key: UUID]: Viewport } = {};
    public readonly vehicles: { readonly [key: UUID]: Vehicle } = {};
    public readonly personnel: { readonly [key: UUID]: Personnel } = {};
    public readonly patients: { readonly [key: UUID]: Patient } = {};
    public readonly materials: { readonly [key: UUID]: Material } = {};
    public readonly mapImages: { readonly [key: UUID]: MapImage } = {};
    public readonly transferPoints: { readonly [key: UUID]: TransferPoint } =
        {};
    public readonly hospitals: { readonly [key: UUID]: Hospital } = {};
    public readonly hospitalPatients: {
        readonly [key: UUID]: HospitalPatient;
    } = {};
    public readonly alarmGroups: { readonly [key: UUID]: AlarmGroup } = {};
    public readonly clients: { readonly [key: UUID]: Client } = {};
    public readonly patientCategories = defaultPatientCategories;
    public readonly vehicleTemplates = defaultVehicleTemplates;
    public readonly mapImageTemplates = defaultMapImagesTemplates;
    public readonly ecoLog: readonly EocLogEntry[] = [];
    public readonly statusHistory: readonly StatusHistoryEntry[] = [];
    public readonly participantId: string = '';
    public readonly statistics: readonly StatisticsEntry[] = [];
    public readonly configuration = ExerciseConfiguration.create();

    /**
     * @deprecated Use {@link create} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-useless-constructor
    constructor() {}

    static readonly create = getCreate(this);

    static getStatus(
        state: ExerciseState
    ): StatusHistoryEntry['status'] | 'notStarted' {
        return (
            state.statusHistory[state.statusHistory.length - 1]?.status ??
            'notStarted'
        );
    }
}
