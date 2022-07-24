import type { UUID } from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import type { ExerciseWrapper } from '../../exercise/exercise-wrapper';
import { RestoreError } from '../../utils/restore-error';

/**
 * Such a function MUST update the initial state of the exercise with the provided {@link exerciseId} as well as every action associated with it from its current state version to the next version in a way that they are valid states/actions.
 * It MAY throw a {@link RestoreError} in a case where upgrading is impossible and a terminal incompatibility with older exercises is necessary.
 * It MUST update the respective updates to the exercise and its associated objects in the database.
 * All database interaction MUST use the provided {@link EntityManager}.
 */
export type DbMigrationFunction = (
    entityManager: EntityManager,
    exerciseId: UUID
) => Promise<void>;

/**
 * Such a function MUST update the initial state of the provided {@link exerciseWrapper} as well as every action associated with it from its current state version to the next version in a way that they are valid states/actions.
 * It MAY throw a {@link RestoreError} in a case where upgrading is impossible and a terminal incompatibility with older exercises is necessary.
 * It MUST NOT use the database.
 */
export type InMemoryMigrationFunction = (
    exerciseWrapper: ExerciseWrapper
) => Promise<ExerciseWrapper>;

export interface MigrationFunctions {
    database: DbMigrationFunction;
    inMemory: InMemoryMigrationFunction;
}

// TODO: It'd probably be better not to export this
/**
 * This object MUST provide entries for every positive integer greater than 1 and less than or equal to ExerciseState.currentStateVersion.
 * A function with key `k` MUST be able to transform a valid exercise of state version `k-1` to a valid exercise of state version `k`.
 */
export const migrations: {
    [key: number]: MigrationFunctions;
} = {
    2: {
        database: (_entityManager: EntityManager, exerciseId: UUID) => {
            throw new RestoreError('The migration is not possible', exerciseId);
        },
        inMemory: (exerciseWrapper: ExerciseWrapper) => {
            throw new RestoreError(
                'The migration is not possible',
                exerciseWrapper.id ?? 'unknown id'
            );
        },
    },
};

export async function migrateInDatabaseTo(
    targetStateVersion: number,
    currentStateVersion: number,
    exerciseId: UUID,
    entityManager: EntityManager
): Promise<void> {
    let currentVersion = currentStateVersion;
    while (++currentVersion <= targetStateVersion) {
        // eslint-disable-next-line no-await-in-loop
        await migrations[currentVersion]!.database(entityManager, exerciseId);
    }
}

export async function migrateInMemoryTo(
    targetStateVersion: number,
    currentStateVersion: number,
    exercise: ExerciseWrapper
): Promise<ExerciseWrapper> {
    let currentVersion = currentStateVersion;
    let currentExercise = exercise;
    while (++currentVersion <= targetStateVersion) {
        // eslint-disable-next-line no-await-in-loop
        currentExercise = await migrations[currentVersion]!.inMemory(
            currentExercise
        );
    }
    return currentExercise;
}
