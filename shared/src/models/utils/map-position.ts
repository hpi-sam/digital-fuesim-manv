import { getCreate } from './get-create';
import type { MapCoordinates } from './map-coordinates';

export class MapPosition {
    public readonly type: 'Coordinates';

    public readonly position: MapCoordinates;

    /**
     * @deprecated Use {@link create} instead
     */
    constructor(position: MapCoordinates) {
        this.type = 'Coordinates';
        this.position = position;
    }

    static readonly create = getCreate(this);
}
