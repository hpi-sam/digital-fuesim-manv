import type { UUID, Position } from 'digital-fuesim-manv-shared';

export interface CateringLine {
    readonly id: `${UUID}:${UUID}`;

    readonly catererPosition: Position;
    readonly patientPosition: Position;
}
