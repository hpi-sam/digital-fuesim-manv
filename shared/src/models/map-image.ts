import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { Position, getCreate, ImageProperties } from './utils';

export class MapImage {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @Type(() => Position)
    public readonly position: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(topLeft: Position, image: ImageProperties) {
        this.position = topLeft;
        this.image = image;
    }

    static readonly create = getCreate(this);
}
