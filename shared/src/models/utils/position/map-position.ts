import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../../utils/validators';
import { getCreate } from '../get-create';
import { MapCoordinates } from './map-coordinates';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isOnMap, isNotOnMap, coordinatesOf } from './position-helpers';

export class MapPosition {
    /**
     * @deprecated Use {@link isOnMap } or {@link isNotOnMap} instead
     */
    @IsValue('coordinates')
    public readonly type = 'coordinates';

    /**
     * @deprecated Use {@link coordinatesOf} instead
     */
    @Type(() => MapCoordinates)
    @ValidateNested()
    public readonly position: MapCoordinates;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates) {
        this.position = position;
    }

    static readonly create = getCreate(this);
}
