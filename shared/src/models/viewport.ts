import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsMetaPosition } from '../utils/validators/is-metaposition';
import {
    coordinatesOf,
    getCreate,
    MapPosition,
    MetaPosition,
    Size,
} from './utils';
import type { ImageProperties, MapCoordinates } from './utils';

export class Viewport {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    /**
     * top-left position
     */
    @ValidateNested()
    @IsMetaPosition()
    public readonly metaPosition: MetaPosition;

    @ValidateNested()
    @Type(() => Size)
    public readonly size: Size;

    @IsString()
    public readonly name: string;

    /**
     * @param position top-left position
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates, size: Size, name: string) {
        this.metaPosition = MapPosition.create(position);
        this.size = size;
        this.name = name;
    }

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/viewport.svg',
        height: 1800,
        aspectRatio: 1600 / 900,
    };

    static isInViewport(viewport: Viewport, position: MapCoordinates): boolean {
        return (
            coordinatesOf(viewport).x <= position.x &&
            position.x <= coordinatesOf(viewport).x + viewport.size.width &&
            coordinatesOf(viewport).y - viewport.size.height <= position.y &&
            position.y <= coordinatesOf(viewport).y
        );
    }
}
