import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../../utils/validators/index.js';
import { getCreate } from '../get-create.js';
import { MapCoordinates } from './map-coordinates.js';
// import needed to display @link Links in Comments
import {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isOnMap,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isNotOnMap,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentCoordinatesOf,
} from './position-helpers.js';

export class MapPosition {
    /**
     * @deprecated Use {@link isOnMap } or {@link isNotOnMap} instead
     */
    @IsValue('coordinates')
    public readonly type = 'coordinates';

    /**
     * @deprecated Use {@link currentCoordinatesOf} instead
     */
    @Type(() => MapCoordinates)
    @ValidateNested()
    public readonly coordinates: MapCoordinates;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates) {
        this.coordinates = position;
    }

    static readonly create = getCreate(this);
}
