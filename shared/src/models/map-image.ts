import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { uuid, UUID, uuidValidationOptions } from '../utils';
import { IsMetaPosition } from '../utils/validators/is-metaposition';
import type { MapCoordinates } from './utils';
import { MapPosition, getCreate, ImageProperties, MetaPosition } from './utils';

export class MapImage {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @ValidateNested()
    @IsMetaPosition()
    public readonly metaPosition: MetaPosition;

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
        topLeft: MapCoordinates,
        image: ImageProperties,
        isLocked: boolean,
        zIndex: number
    ) {
        this.metaPosition = MapPosition.create(topLeft);
        this.image = image;
        this.isLocked = isLocked;
        this.zIndex = zIndex;
    }

    static readonly create = getCreate(this);
}
