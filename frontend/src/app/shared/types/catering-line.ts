import type { UUID, MapCoordinates } from 'digital-fuesim-manv-shared';

export interface CateringLine {
    readonly id: `${UUID}:${UUID}`;

    readonly catererPosition: MapCoordinates;
    readonly patientPosition: MapCoordinates;
}
