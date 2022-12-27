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
import {
    defaultMapImagesTemplates,
    defaultPatientCategories,
    defaultVehicleTemplates,
} from './data';
import { defaultMaterialTemplates } from './data/default-state/material-templates';
import { defaultPersonnelTemplates } from './data/default-state/personnel-templates';
import {
    AlarmGroup,
    Client,
    EocLogEntry,
    Hospital,
    HospitalPatient,
    MapImage,
    MapImageTemplate,
    Material,
    Patient,
    Personnel,
    TransferPoint,
    Vehicle,
    VehicleTemplate,
    Viewport,
} from './models';
import { ExerciseConfiguration } from './models/exercise-configuration';
import type { MaterialTemplate } from './models/material-template';
import { PatientCategory } from './models/patient-category';
import type { PersonnelTemplate } from './models/personnel-template';
import type { PersonnelType } from './models/utils';
import {
    ExerciseStatus,
    exerciseStatusAllowedValues,
    getCreate,
    SpatialTree,
} from './models/utils';
import type { MaterialType } from './models/utils/material-type';
import type { SpatialElementType } from './store/action-reducers/utils/spatial-elements';
import type { UUID } from './utils';
import { uuid, uuidValidationOptions } from './utils';
import { IsIdMap, IsLiteralUnion } from './utils/validators';

export class ExerciseState {
    @IsUUID(4, uuidValidationOptions)
    public readonly id = uuid();
    /**
     * The number of ms since the start of the exercise.
     * This time is updated each `tick` by a constant value, is guaranteed to be (a bit) slower than the real time
     * (depending on the server load and overhead of the tick).
     *
     * It is guaranteed that the `ExerciseTickAction` is the only action that modifies this value.
     */
    @IsInt()
    @Min(0)
    public readonly currentTime = 0;
    @IsLiteralUnion(exerciseStatusAllowedValues)
    public readonly currentStatus: ExerciseStatus = 'notStarted';
    @IsIdMap(Viewport)
    public readonly viewports: { readonly [key: UUID]: Viewport } = {};
    @IsIdMap(Vehicle)
    public readonly vehicles: { readonly [key: UUID]: Vehicle } = {};
    @IsIdMap(Personnel)
    public readonly personnel: { readonly [key: UUID]: Personnel } = {};
    @IsIdMap(Patient)
    public readonly patients: { readonly [key: UUID]: Patient } = {};
    @IsIdMap(Material)
    public readonly materials: { readonly [key: UUID]: Material } = {};
    @IsIdMap(MapImage)
    public readonly mapImages: { readonly [key: UUID]: MapImage } = {};
    @IsIdMap(TransferPoint)
    public readonly transferPoints: { readonly [key: UUID]: TransferPoint } =
        {};
    @IsIdMap(Hospital)
    public readonly hospitals: { readonly [key: UUID]: Hospital } = {};
    @IsIdMap(HospitalPatient, (hospitalPatient) => hospitalPatient.patientId)
    public readonly hospitalPatients: {
        readonly [key: UUID]: HospitalPatient;
    } = {};
    @IsIdMap(AlarmGroup)
    public readonly alarmGroups: { readonly [key: UUID]: AlarmGroup } = {};
    @IsIdMap(Client)
    public readonly clients: { readonly [key: UUID]: Client } = {};
    @IsArray()
    @ValidateNested()
    @Type(() => PatientCategory)
    public readonly patientCategories = defaultPatientCategories;
    @IsArray()
    @ValidateNested()
    @Type(() => VehicleTemplate)
    public readonly vehicleTemplates = defaultVehicleTemplates;
    @IsObject()
    public readonly materialTemplates: {
        [Key in MaterialType]: MaterialTemplate;
    } = defaultMaterialTemplates;
    @IsObject()
    public readonly personnelTemplates: {
        [Key in PersonnelType]: PersonnelTemplate;
    } = defaultPersonnelTemplates;
    @IsArray()
    @ValidateNested()
    @Type(() => MapImageTemplate)
    public readonly mapImageTemplates = defaultMapImagesTemplates;
    @IsArray()
    @ValidateNested()
    @Type(() => EocLogEntry)
    public readonly eocLog: readonly EocLogEntry[] = [];
    @IsString()
    public readonly participantId: string;

    // Mutable<ExerciseState>` could still have immutable objects in spatialTree
    @IsObject()
    public readonly spatialTrees: {
        [type in SpatialElementType]: SpatialTree;
    } = {
        materials: SpatialTree.create(),
        patients: SpatialTree.create(),
        personnel: SpatialTree.create(),
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
    static readonly currentStateVersion = 14;
}
