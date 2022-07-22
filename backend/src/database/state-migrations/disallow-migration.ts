import type { UUID } from 'digital-fuesim-manv-shared';
import type { ExerciseWrapper } from 'exercise/exercise-wrapper';
import type { EntityManager } from 'typeorm';
import { RestoreError } from '../../utils/restore-error';

export const disallowMigration = {
    database: (_entityManager: EntityManager, exerciseId: UUID) => {
        throw new RestoreError('The migration is not possible', exerciseId);
    },
    inMemory: (exerciseWrapper: ExerciseWrapper) => {
        throw new RestoreError(
            'The migration is not possible',
            exerciseWrapper.id ?? 'unknown id'
        );
    },
};
