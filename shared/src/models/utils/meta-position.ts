import type { UUID } from '../../utils';
import type { MapCoordinates } from './map-coordinates';
import type { Transfer } from './transfer';

export type MetaPosition =
    | { type: 'Coordinates'; position: MapCoordinates }
    | { type: 'SimulatedRegion'; uuid: UUID }
    | { type: 'Transfer'; transfer: Transfer }
    | { type: 'Vehicle'; uuid: UUID };
