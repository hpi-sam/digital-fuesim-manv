import { IsString, IsUUID, ValidateNested } from 'class-validator';
import type { UUID } from '../utils';
import { uuid, uuidValidationOptions } from '../utils';
import type { Size } from './utils';

export class ImageTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @IsUUID(4, uuidValidationOptions)
    public imageBlobId: UUID;

    @ValidateNested()
    public initialSize: Size;

    constructor(name: string, imageBlobId: UUID, initialSize: Size) {
        this.name = name;
        this.imageBlobId = imageBlobId;
        this.initialSize = initialSize;
    }
}
