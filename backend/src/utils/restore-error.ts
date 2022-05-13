import type { UUID } from 'digital-fuesim-manv-shared';

export class RestoreError extends Error {
    public constructor(message: string, public readonly exerciseId: UUID) {
        super(`Failed to restore exercise \`${exerciseId}\`: ${message}`);
    }
}
