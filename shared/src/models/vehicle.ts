import { Type } from 'class-transformer';
import {
    IsArray,
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { ReducerError } from '../store';
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

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * If an array, at position 0 it means zero patients are loaded
     * at position 1 one patient is loaded, etc.
     */
    @IsArray()
    @ValidateNested()
    @Type(() => ImageProperties)
    @IsOptional()
    public readonly imagesPatientsLoaded?: ImageProperties[];

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
        image: ImageProperties,
        imagesPatientsLoaded?: ImageProperties[]
    ) {
        this.vehicleType = vehicleType;
        this.name = name;
        this.materialIds = materialIds;
        this.patientCapacity = patientCapacity;
        this.image = image;
        if (
            imagesPatientsLoaded !== undefined &&
            imagesPatientsLoaded.length + 1 !== patientCapacity
        )
            throw new ReducerError(
                `vehicle was tried to be created, but imagesPatientsLoaded.length is not equal to patientCapacity`
            );
        this.imagesPatientsLoaded = imagesPatientsLoaded;
    }

    static readonly create = getCreate(this);
}
