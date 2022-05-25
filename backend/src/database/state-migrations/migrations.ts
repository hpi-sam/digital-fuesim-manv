import type { UUID } from 'digital-fuesim-manv-shared';
import { EntityManager } from 'typeorm';
import type { ExerciseWrapper } from '../../exercise/exercise-wrapper';

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

export type MigrationFunctions = [
    DbMigrationFunction,
    InMemoryMigrationFunction
];

/**
 * This object MUST provide entries for every positive integer greater than 1 and less than or equal to ExerciseState.currentStateVersion.
 * A function with key `k` MUST be able to transform a valid exercise of state version `k-1` to a valid exercise of state version `k`.
 */
export const migrations: {
    [key: number]: MigrationFunctions;
} = {};

/**
 *
 * @param targetStateVersion The state version the exercise provided by {@link input} should have after running the migrations.
 * @param currentStateVersion The current state version of the exercise, before applying any migration.
 * @param input Either the id of the exercise to migrate in the database, or {@link ExerciseWrapper} to be migrated in memory.
 * @param entityManager In case the database should get used the {@link EntityManager} of the current transaction.
 * @returns Either the id of the migrated exercise in the database, or the migrated {@link ExerciseWrapper}.
 */
export async function migrateTo<MigrationTarget extends ExerciseWrapper | UUID>(
    targetStateVersion: number,
    currentStateVersion: number,
    input: MigrationTarget,
    entityManager: MigrationTarget extends UUID
        ? EntityManager
        : EntityManager | undefined
): Promise<MigrationTarget> {
    for (let i = currentStateVersion + 1; i <= targetStateVersion; i++) {
        if (entityManager instanceof EntityManager) {
            // eslint-disable-next-line no-await-in-loop
            await migrations[i][0](entityManager, input as UUID);
        } else {
            // TODO: Better typing
            // eslint-disable-next-line no-await-in-loop, no-param-reassign
            input = (await migrations[i][1](input as ExerciseWrapper)) as any;
        }
    }
    return input;
}
