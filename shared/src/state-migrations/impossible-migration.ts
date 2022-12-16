import type { UUID } from '../utils';
import type { Migration } from './migration-functions';
import { RestoreError } from './restore-error';

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
