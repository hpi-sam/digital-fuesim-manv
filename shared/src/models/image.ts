import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { Size, Position, getCreate } from './utils';

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

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(topLeft: Position, size: Size, blobId: UUID) {
        this.topLeft = topLeft;
        this.size = size;
        this.blobId = blobId;
    }

    static readonly create = getCreate(this);
}
