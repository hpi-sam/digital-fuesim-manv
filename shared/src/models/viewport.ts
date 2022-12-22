import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Position, Size } from './utils';
import type { ImageProperties } from './utils';

export class Viewport {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    /**
     * top-left position
     */
    @ValidateNested()
    @Type(() => Position)
    public readonly position: Position;

    @ValidateNested()
    @Type(() => Size)
    public readonly size: Size;

    @IsString()
    public readonly name: string;

    /**
     * @param position top-left position
     * @deprecated Use {@link create} instead
     */
    constructor(position: Position, size: Size, name: string) {
        this.position = position;
        this.size = size;
        this.name = name;
    }

    static readonly create = getCreate(this);

    static image: ImageProperties = {
        url: 'assets/viewport.svg',
        height: 1800,
        aspectRatio: 1600 / 900,
    };

    static isInViewport(viewport: Viewport, position: Position): boolean {
        return (
            viewport.position.x <= position.x &&
            position.x <= viewport.position.x + viewport.size.width &&
            viewport.position.y - viewport.size.height <= position.y &&
            position.y <= viewport.position.y
        );
    }
}
