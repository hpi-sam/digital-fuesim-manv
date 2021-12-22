import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import { Position, Size } from './utils';

export class Image {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public topLeft: Position;

    @ValidateNested()
    @Type(() => Size)
    public size: Size;

    @IsUUID(4, uuidValidationOptions)
    public blobId: UUID;

    constructor(topLeft: Position, size: Size, blobId: UUID) {
        this.topLeft = topLeft;
        this.size = size;
        this.blobId = blobId;
    }
}
