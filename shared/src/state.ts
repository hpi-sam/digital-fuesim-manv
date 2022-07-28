import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsObject,
    IsString,
    IsUUID,
    Min,
    ValidateNested,
} from 'class-validator';
import { defaultMapImagesTemplates } from './data/default-state/map-images-templates';
import { defaultPatientCategories } from './data/default-state/patient-templates';
import { defaultVehicleTemplates } from './data/default-state/vehicle-templates';
import type {
    AlarmGroup,
    Client,
    Hospital,
    HospitalPatient,
    MapImage,
    Material,
    Patient,
    Personnel,
    TransferPoint,
    Vehicle,
    Viewport,
} from './models';
import { ExerciseConfiguration } from './models/exercise-configuration';
import { EocLogEntry, VehicleTemplate, MapImageTemplate } from './models';
import { getCreate } from './models/utils';
import type { UUID } from './utils';
import { uuidValidationOptions, uuid } from './utils';
import { PatientCategory } from './models/patient-category';
import type { DataStructureElementType } from './models/utils/datastructure';
import { DataStructureInState } from './models/utils/datastructure';
import { ExerciseStatus } from './models/utils/exercise-status';

export class ExerciseState {
    @IsUUID(4, uuidValidationOptions)
    public readonly id = uuid();
    /**
     * The number of ms since the start of the exercise.
     * This time is updated each `tick` by a constant value, is guaranteed to be (a bit) slower than the real time
     * (depending on the server load and overhead of the tick).
     */
    @IsInt()
    @Min(0)
    public readonly currentTime = 0;
    @IsString()
    public readonly currentStatus: ExerciseStatus = 'notStarted';
    @IsObject()
    public readonly viewports: { readonly [key: UUID]: Viewport } = {};
    @IsObject()
    public readonly vehicles: { readonly [key: UUID]: Vehicle } = {};
    @IsObject()
    public readonly personnel: { readonly [key: UUID]: Personnel } = {};
    @IsObject()
    public readonly patients: { readonly [key: UUID]: Patient } = {};
    @IsObject()
    public readonly materials: { readonly [key: UUID]: Material } = {};
    @IsObject()
    public readonly mapImages: { readonly [key: UUID]: MapImage } = {};
    @IsObject()
    public readonly transferPoints: { readonly [key: UUID]: TransferPoint } =
        {};
    @IsObject()
    public readonly hospitals: { readonly [key: UUID]: Hospital } = {};
    @IsObject()
    public readonly hospitalPatients: {
        readonly [key: UUID]: HospitalPatient;
    } = {};
    @IsObject()
    public readonly alarmGroups: { readonly [key: UUID]: AlarmGroup } = {};
    @IsObject()
    public readonly clients: { readonly [key: UUID]: Client } = {};
    @IsArray()
    @ValidateNested()
    @Type(() => PatientCategory)
    public readonly patientCategories = defaultPatientCategories;
    @IsArray()
    @ValidateNested()
    @Type(() => VehicleTemplate)
    public readonly vehicleTemplates = defaultVehicleTemplates;
    @IsArray()
    @ValidateNested()
    @Type(() => MapImageTemplate)
    public readonly mapImageTemplates = defaultMapImagesTemplates;
    @IsArray()
    @ValidateNested()
    @Type(() => EocLogEntry)
    public readonly eocLog: readonly EocLogEntry[] = [];
    @IsString()
    public readonly participantId: string = '';

    @IsObject()
    public readonly dataStructures: {
        readonly [key in DataStructureElementType]: DataStructureInState;
    } = {
        materials: DataStructureInState.create(),
        patients: DataStructureInState.create(),
        personnel: DataStructureInState.create(),
    };

    @ValidateNested()
    @Type(() => ExerciseConfiguration)
    public readonly configuration = ExerciseConfiguration.create();

    /**
     * @deprecated Use {@link create} instead.
     */
    constructor(participantId: string) {
        this.participantId = participantId;
    }

    static readonly create = getCreate(this);

    /**
     * **Important**
     *
     * This number MUST be increased every time a change to any object (that is part of the state or the state itself) is made in a way that there may be states valid before that are no longer valid.
     */
    static readonly currentStateVersion = 6;
}
