import { Type } from 'class-transformer';
import { IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
import { uuid, uuidValidationOptions, UUID, UUIDSet } from '../utils';
import { IsUUIDSet, IsValue } from '../utils/validators';
import { IsPosition } from '../utils/validators/is-position';
import { getCreate } from './utils';
import { ImageProperties } from './utils/image-properties';
import { Position } from './utils/position/position';
import {
    ExerciseOccupation,
    occupationTypeOptions,
} from './utils/occupations/exercise-occupation';

export class Vehicle {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('vehicle' as const)
    public readonly type = 'vehicle';

    @IsString()
    public readonly vehicleType: string;

    @IsString()
    public readonly name: string;

    @IsUUIDSet()
    public readonly materialIds: UUIDSet = {};

    @IsNumber()
    public readonly patientCapacity: number;

    /**
     * @deprecated Do not access directly, use helper methods from models/utils/position/position-helpers(-mutable) instead.
     */
    @IsPosition()
    @ValidateNested()
    public readonly position: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    @IsUUIDSet()
    public readonly personnelIds: UUIDSet = {};

    @IsUUIDSet()
    public readonly patientIds: UUIDSet = {};

    @Type(...occupationTypeOptions)
    @ValidateNested()
    public readonly occupation: ExerciseOccupation;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        name: string,
        materialIds: UUIDSet,
        patientCapacity: number,
        image: ImageProperties,
        position: Position,
        occupation: ExerciseOccupation
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.materialIds = materialIds;
        this.patientCapacity = patientCapacity;
        this.image = image;
        this.position = position;
        this.occupation = occupation;
    }

    static readonly create = getCreate(this);
}
