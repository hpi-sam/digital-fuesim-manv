import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Position, Size } from './utils';
import type { ImageProperties } from './utils';

export class Viewport {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public readonly topLeft: Position;

    @ValidateNested()
    @Type(() => Size)
    public readonly size: Size;

    @IsString()
    public readonly name: string;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(topLeft: Position, size: Size, name: string) {
        this.topLeft = topLeft;
        this.size = size;
        this.name = name;
    }

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/material.svg',
        height: 400,
        aspectRatio: 134 / 102,
    };
}
