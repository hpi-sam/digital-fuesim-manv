import { Type } from 'class-transformer';
import { IsBoolean, IsUUID, ValidateNested } from 'class-validator';
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
     * Whether the UI should prevent position changes of the map image by drag&drop
     */
    @IsBoolean()
    public readonly isLocked: boolean = false;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(topLeft: Position, image: ImageProperties, isLocked: boolean) {
        this.position = topLeft;
        this.image = image;
        this.isLocked = isLocked;
    }

    static readonly create = getCreate(this);
}
