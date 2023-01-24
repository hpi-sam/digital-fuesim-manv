import { Type } from 'class-transformer';
import {
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { uuid, uuidValidationOptions, UUID, UUIDSet } from '../utils';
import { IsUUIDSet } from '../utils/validators';
import { IsMetaPosition } from '../utils/validators/is-metaposition';
import { getCreate, Position, Transfer } from './utils';
import { ImageProperties } from './utils/image-properties';
import { MetaPosition } from './utils/meta-position';

export class Vehicle {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly vehicleType: string;

    @IsString()
    public readonly name: string;

    @IsUUIDSet()
    public readonly materialIds: UUIDSet = {};

    @IsNumber()
    public readonly patientCapacity: number;

    @IsMetaPosition()
    @ValidateNested()
    public readonly metaPosition: MetaPosition;

    /**
     * @deprecated use {@link metaPosition}
     * Exclusive-or to {@link transfer}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated use {@link metaPosition}
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
        metaPosition: MetaPosition
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.materialIds = materialIds;
        this.patientCapacity = patientCapacity;
        this.image = image;
        this.metaPosition = metaPosition;
    }

    static readonly create = getCreate(this);
}
