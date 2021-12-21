import { IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { Position, Size } from './utils';

export class Image {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    public topLeft: Position;

    @ValidateNested()
    public size: Size;

    @IsUUID(4, uuidValidationOptions)
    public blobId: UUID;

    constructor(topLeft: Position, size: Size, blobId: UUID) {
        this.topLeft = topLeft;
        this.size = size;
        this.blobId = blobId;
    }
}
