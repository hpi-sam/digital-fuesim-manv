import { IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { Position, Size } from './utils';

export class Image {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @ValidateNested()
    public topLeft: Position;

    @ValidateNested()
    public size: Size;

    @IsUUID(4, UUIDValidationOptions)
    public blobId: UUID;

    constructor(topLeft: Position, size: Size, blobId: UUID) {
        this.topLeft = topLeft;
        this.size = size;
        this.blobId = blobId;
    }
}
