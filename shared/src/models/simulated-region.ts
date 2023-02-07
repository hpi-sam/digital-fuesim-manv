import { Type } from 'class-transformer';
import { IsString, IsUUID, ValidateNested } from 'class-validator';
import { UUID, uuid, uuidValidationOptions } from '../utils';
import { IsPosition } from '../utils/validators/is-position';
import { IsValue } from '../utils/validators';
import {
    getCreate,
    isInSimulatedRegion,
    MapPosition,
    Position,
    currentSimulatedRegionIdOf,
    Size,
} from './utils';
import type { ImageProperties, MapCoordinates } from './utils';
import type { WithPosition } from './utils/position/with-position';

export class SimulatedRegion {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('simulatedRegion' as const)
    public readonly type = 'simulatedRegion';

    /**
     * top-left position
     *
     * @deprecated Do not access directly, use helper methods from models/utils/position/position-helpers(-mutable) instead.
     */
    @ValidateNested()
    @IsPosition()
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
    constructor(position: MapCoordinates, size: Size, name: string) {
        this.position = MapPosition.create(position);
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
        withPosition: WithPosition
    ): boolean {
        return (
            isInSimulatedRegion(withPosition) &&
            currentSimulatedRegionIdOf(withPosition) === region.id
        );
    }
}
