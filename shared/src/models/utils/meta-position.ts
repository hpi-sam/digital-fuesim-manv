import type { UUID } from '../../utils';
import type { MapCoordinates } from './map-coordinates';

export type MetaPosition =
    | { type: 'Coordinates'; position: MapCoordinates }
    | { type: 'SimulatedRegion'; uuid: UUID }
    | { type: 'Transfer'; uuid: UUID }
    | { type: 'Vehicle'; uuid: UUID };
