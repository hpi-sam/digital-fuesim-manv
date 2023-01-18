import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { getCreate, Position, Size } from './utils';
import type { ImageProperties } from './utils';

export class SimulatedRegion {
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
        url: 'assets/simulated-region.svg',
        height: 1800,
        aspectRatio: 1600 / 900,
    };

    static isInSimulatedRegion(
        region: SimulatedRegion,
        position: Position
    ): boolean {
        // This class was copied from viewport.ts
        // We will have to implement this logic differently
        // later, for now, this is a stub method
        return false;
    }
}
