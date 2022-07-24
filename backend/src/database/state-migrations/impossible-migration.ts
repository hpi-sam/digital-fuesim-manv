import type { UUID } from 'digital-fuesim-manv-shared';
import { RestoreError } from '../../utils/restore-error';
import type { MigrationSpecification } from './migrations';

export const impossibleMigration: MigrationSpecification = {
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
