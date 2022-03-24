import { Type } from 'class-transformer';
import {
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import type { UUIDSet } from '../utils';
import { uuid, uuidValidationOptions, UUID } from '../utils';
import { Position } from './utils';
import type { Transfer } from './utils';
import { ImageProperties } from './utils/image-properties';

export class Vehicle {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsUUID(4, uuidValidationOptions)
    public materialId: UUID;

    @IsNumber()
    public patientCapacity: number;

    @IsString()
    public name: string;

    /**
     * Exclusive-or to {@link transfer}
     */
    @ValidateNested()
    @Type(() => Position)
    @IsOptional()
    public position?: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public image: ImageProperties;

    /**
     * Exclusive-or to {@link position}
     */
    // @ValidateNested()
    // @Type(() => Transfer)
    // @IsOptional()
    public transfer?: Transfer;

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    public personellIds: UUIDSet = {};

    // @IsUUID(4, uuidArrayValidationOptions) // TODO: this doesn't work on this kind of set
    public patientIds: UUIDSet = {};

    constructor(
        materialId: UUID,
        patientCapacity: number,
        name: string,
        image: ImageProperties
    ) {
        this.materialId = materialId;
        this.patientCapacity = patientCapacity;
        this.name = name;
        this.image = image;
    }
}
