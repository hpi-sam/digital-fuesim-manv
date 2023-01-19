import type { UUID } from '../../utils';
import type { MapPosition } from './map-position';
import type { Transfer } from './transfer';
import type { VehiclePosition } from './vehicle-position';

export type MetaPosition =
    | MapPosition
    | VehiclePosition
    | { type: 'SimulatedRegion'; uuid: UUID }
    | { type: 'Transfer'; transfer: Transfer };
