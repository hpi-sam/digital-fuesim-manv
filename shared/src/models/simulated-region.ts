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
    simulatedRegionItsIn,
    Size,
} from './utils';
import type { ImageProperties, MapCoordinates } from './utils';
import type { WithPosition } from './utils/position/with-meta-position';

export class SimulatedRegion {
    @IsUUID(4, uuidValidationOptions)
    public readonly id: UUID = uuid();

    @IsValue('simulatedRegion' as const)
    public readonly type = 'simulatedRegion';

    /**
     * top-left position
     */
    @ValidateNested()
    @IsPosition()
    public readonly metaPosition: Position;

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
            simulatedRegionItsIn(withPosition) === region.id
        );
    }
}
