import type { UUID } from 'digital-fuesim-manv-shared';

export class RestoreError extends Error {
    public constructor(
        message: string,
        public readonly exerciseId: UUID,
        innerError?: Error
    ) {
        super(`Failed to restore exercise \`${exerciseId}\`: ${message}`);
        this.cause = innerError;
    }
}
