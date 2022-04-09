import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { Size } from './utils';

export class ImageTemplate {
    @IsUUID(4, uuidValidationOptions)
    public id: UUID = uuid();

    @IsString()
    public name: string;

    @IsUUID(4, uuidValidationOptions)
    public imageBlobId: UUID;

    @ValidateNested()
    @Type(() => Size)
    public initialSize: Size;

    private constructor(name: string, imageBlobId: UUID, initialSize: Size) {
        this.name = name;
        this.imageBlobId = imageBlobId;
        this.initialSize = initialSize;
    }

    static create(name: string, imageBlobId: UUID, initialSize: Size) {
        return { ...new ImageTemplate(name, imageBlobId, initialSize) };
    }
}
