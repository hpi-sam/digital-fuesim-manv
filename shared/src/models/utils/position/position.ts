import type { MapPosition } from './map-position';
import type { SimulatedRegionPosition } from './simulated-region-position';
import type { TransferPosition } from './transfer-position';
import type { VehiclePosition } from './vehicle-position';

export type Position =
    | MapPosition
    | SimulatedRegionPosition
    | TransferPosition
    | VehiclePosition;
