import type { MapPosition } from './map-position.js';
import type { SimulatedRegionPosition } from './simulated-region-position.js';
import type { TransferPosition } from './transfer-position.js';
import type { VehiclePosition } from './vehicle-position.js';

export type Position =
    | MapPosition
    | SimulatedRegionPosition
    | TransferPosition
    | VehiclePosition;
