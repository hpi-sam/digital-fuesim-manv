import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import { MapCoordinates } from './map-coordinates';
// import needed to display @link Links in Comments
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isOnMap, isNotOnMap, currentCoordinatesOf } from './position-helpers';

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
