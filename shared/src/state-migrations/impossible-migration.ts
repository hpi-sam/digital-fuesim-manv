import type { UUID } from '../utils';
import type { Migration } from './migration-functions';

export const impossibleMigration: Migration = {
    actions: (initialState, actions) => {
        throw new RestoreError(
            'The migration is not possible',
            (initialState as { id?: UUID }).id ?? 'unknown'
        );
    },
    state: (state) => {
        throw new RestoreError(
            'The migration is not possible',
            (state as { id?: UUID }).id ?? 'unknown'
        );
    },
};

// TODO: Rename into `MigrationError` (upstream changes in the backend)
class RestoreError extends Error {
    public constructor(
        message: string,
        public readonly exerciseId: UUID,
        innerError?: Error
    ) {
        super(`Failed to restore exercise \`${exerciseId}\`: ${message}`);
        this.cause = innerError;
    }
}
