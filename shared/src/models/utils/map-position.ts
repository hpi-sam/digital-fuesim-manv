import { getCreate } from './get-create';
import type { MapCoordinates } from './map-coordinates';

export class MapPosition {
    public readonly type = 'coordinates';

    public readonly position: MapCoordinates;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates) {
        this.position = position;
    }

    static readonly create = getCreate(this);
}
