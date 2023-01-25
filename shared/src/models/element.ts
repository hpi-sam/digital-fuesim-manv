import type { AlarmGroup } from './alarm-group';
import type { Client } from './client';
import type { Hospital } from './hospital';
import type { MapImage } from './map-image';
import type {
    Material,
    Patient,
    Personnel,
    SimulatedRegion,
    TransferPoint,
    Vehicle,
    Viewport,
} from '.';

export type Element =
    | AlarmGroup
    | Client
    | Hospital
    | MapImage
    | Material
    | Patient
    | Personnel
    | SimulatedRegion
    | TransferPoint
    | Vehicle
    | Viewport;
