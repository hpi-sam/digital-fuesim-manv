import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { IsValue } from '../utils/validators';
import { Position, getCreate, ImageProperties } from './utils';

export class MapImage {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('mapImage' as const)
    public readonly type = 'mapImage';

    @ValidateNested()
    @Type(() => Position)
    public readonly position: Position;

    @ValidateNested()
    @Type(() => ImageProperties)
    public readonly image: ImageProperties;

    /**
     * Determines the rendering order among other mapImages.
     * A smaller number means the mapImage is behind another one.
     * The index can also be negative.
     * MapImages with the same zIndex don't have a defined order.
     */
    @IsInt()
    public readonly zIndex: number;

    /**
     * Whether the UI should prevent position changes of the map image by drag&drop
     */
    @IsBoolean()
    public readonly isLocked: boolean = false;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(
        topLeft: Position,
        image: ImageProperties,
        isLocked: boolean,
        zIndex: number
    ) {
        this.position = topLeft;
        this.image = image;
        this.isLocked = isLocked;
        this.zIndex = zIndex;
    }

    static readonly create = getCreate(this);
}
