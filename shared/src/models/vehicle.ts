import { Type } from 'class-transformer';
import {
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { uuid, uuidValidationOptions, UUID, UUIDSet } from '../utils';
import { IsUUIDSet, IsValue } from '../utils/validators';
import { IsPosition } from '../utils/validators/is-position';
import { getCreate, Transfer } from './utils';
import { ImageProperties } from './utils/image-properties';
import { Position } from './utils/position/position';

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

    @IsPosition()
    @ValidateNested()
    public readonly position: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated use {@link position}
     * Exclusive-or to {@link position}
     */
    @ValidateNested()
    @Type(() => Transfer)
    @IsOptional()
    public readonly transfer?: Transfer;

    @IsUUIDSet()
    public readonly personnelIds: UUIDSet = {};

    @IsUUIDSet()
    public readonly patientIds: UUIDSet = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        name: string,
        materialIds: UUIDSet,
        patientCapacity: number,
        image: ImageProperties,
        position: Position
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.materialIds = materialIds;
        this.patientCapacity = patientCapacity;
        this.image = image;
        this.position = position;
    }

    static readonly create = getCreate(this);
}
