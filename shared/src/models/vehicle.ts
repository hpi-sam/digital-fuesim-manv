import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { uuid, uuidValidationOptions, UUID, UUIDSet } from '../utils';
import { getCreate, Position, Transfer } from './utils';
import { ImageProperties } from './utils/image-properties';

export class Vehicle {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly vehicleType: string;

    @IsString()
    public readonly name: string;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly materialIds: UUIDSet = {};

    @IsNumber()
    public readonly patientCapacity: number;

    /**
     * Exclusive-or to {@link transfer}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public readonly position?: Position;

    /**
     * currentImage, loaded from images
     */
    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * If an array, at position 0 it means zero patients are loaded
     * at position 1 one patient is loaded, etc.
     */
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ImageProperties)
    public readonly images: ImageProperties[];

    /**
     * Exclusive-or to {@link position}
     */
    @ValidateNested()
    @Type(() => Transfer)
    @IsOptional()
    public readonly transfer?: Transfer;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly personnelIds: UUIDSet = {};

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    @IsDefined()
    public readonly patientIds: UUIDSet = {};

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        vehicleType: string,
        name: string,
        materialIds: UUIDSet,
        patientCapacity: number,
        images: ImageProperties[]
    ) {
        // TODO: check that there can't be more images than patients that can be loaded + 1
        // if (images.length > patientCapacity + 1)
        //     throw new ReducerError(
        //         `vehicle was tried to be created, but imagesP.length is greater than patientCapacity + 1`
        //     );

        this.vehicleType = vehicleType;
        this.name = name;
        this.materialIds = materialIds;
        this.patientCapacity = patientCapacity;
        this.images = images;
        this.image = this.images[0]!;
    }

    static readonly create = getCreate(this);
}
