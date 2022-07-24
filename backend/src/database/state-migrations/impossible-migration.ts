import { RestoreError } from '../../utils/restore-error';
import type { Migrations } from './migrations';

export const impossibleMigration: Migrations = {
    database: (_entityManager, exerciseId) => {
        throw new RestoreError('The migration is not possible', exerciseId);
    },
    stateExport: (stateExport) => {
        throw new RestoreError(
            'The migration is not possible',
            stateExport.currentState.id ?? 'unknown id'
        );
    },
};
