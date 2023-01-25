import type { MapPosition } from './map-position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';

export type MetaPosition =
    | MapPosition
    | SimulatedRegionPosition
    | TransferPosition
    | VehiclePosition;
