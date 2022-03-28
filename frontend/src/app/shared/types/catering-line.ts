import type { Immutable, UUID, Position } from 'digital-fuesim-manv-shared';

export type CateringLine = Immutable<{
    id: `${UUID}:${UUID}`;

    catererPosition: Position;
    patientPosition: Position;
}>;
