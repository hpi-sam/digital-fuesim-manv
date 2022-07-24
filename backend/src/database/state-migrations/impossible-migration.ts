import { RestoreError } from '../../utils/restore-error';
import type { MigrationFunctions } from './migrations';

export const impossibleMigration: MigrationFunctions = {
    database: (_entityManager, exerciseId) => {
        throw new RestoreError('The migration is not possible', exerciseId);
    },
    inMemory: (exerciseWrapper) => {
        throw new RestoreError(
            'The migration is not possible',
            exerciseWrapper.id ?? 'unknown id'
        );
    },
    stateExport: (stateExport) => {
        throw new RestoreError(
            'The migration is not possible',
            stateExport.currentState.id ?? 'unknown id'
        );
    },
};
