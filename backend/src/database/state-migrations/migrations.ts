import type { UUID } from 'digital-fuesim-manv-shared';

/**
 * Such a function MUST update the initial state of the exercise with the provided {@link exerciseId} as well as every action associated with it from its current state version to the next version in a way that they are valid states/actions.
 * It MAY throw a {@link RestoreError} in a case where upgrading is impossible and a terminal incompatibility with older exercises is necessary.
 * It MUST update the respective updates to the exercise and its associated objects in the database.
 */
export type MigrationFunction = (exerciseId: UUID) => Promise<void>;

/**
 * This object MUST provide entries for every positive integer greater than 1 and less than or equal to ExerciseState.currentStateVersion.
 * A function with key `k` MUST be able to transform a valid exercise of state version `k-1` to a valid exercise of state version `k`.
 */
export const migrations: {
    [key: number]: MigrationFunction;
} = {};
