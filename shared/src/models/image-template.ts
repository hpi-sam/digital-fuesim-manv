import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Size } from './utils';

export class ImageTemplate {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsString()
    public readonly name: string;

    @IsUUID(4, uuidValidationOptions)
    public readonly imageBlobId: UUID;

    @ValidateNested()
    @Type(() => Size)
    public readonly initialSize: Size;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(name: string, imageBlobId: UUID, initialSize: Size) {
        this.name = name;
        this.imageBlobId = imageBlobId;
        this.initialSize = initialSize;
    }

    static readonly create = getCreate(this);
}
