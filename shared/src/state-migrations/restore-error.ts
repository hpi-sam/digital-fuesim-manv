import type { UUID } from '../utils';

// TODO: Rename into `MigrationError` (upstream changes in the backend)
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
