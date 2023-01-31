import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { IsValue } from '../../utils/validators';
import { getCreate } from './get-create';
import { MapCoordinates } from './map-coordinates';

export class MapPosition {
    @IsValue('coordinates')
    public readonly type = 'coordinates';

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
