import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, UUIDValidationOptions } from '../utils';
import { Size } from './utils';

export class ImageTemplate {
    @IsUUID(4, UUIDValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @IsUUID(4, UUIDValidationOptions)
    public imageBlobId: UUID;

    @ValidateNested()
    public initialSize: Size;

    constructor(name: string, imageBlobId: UUID, initialSize: Size) {
        this.name = name;
        this.imageBlobId = imageBlobId;
        this.initialSize = initialSize;
    }
}
