import type {
    AlarmGroup,
    Client,
    Hospital,
    MapImage,
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
