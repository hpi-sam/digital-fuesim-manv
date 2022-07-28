import type {
    ExerciseState,
    Mutable,
    StateExport,
    UUID,
} from 'digital-fuesim-manv-shared';
import type { EntityManager } from 'typeorm';
import { RestoreError } from '../../utils/restore-error';
import { ActionWrapperEntity } from '../entities/action-wrapper.entity';
import { ExerciseWrapperEntity } from '../entities/exercise-wrapper.entity';
import { updateEocLog3 } from './3-update-eoc-log';
import { removeSetParticipantIdAction4 } from './4-remove-set-participant-id-action';
import { removeStatistics5 } from './5-remove-statistics';
import { impossibleMigration } from './impossible-migration';

/**
 * Such a function gets the already migrated initial state of the exercise and an array of all actions (not yet migrated).
 * It is expected that afterwards the actions in the provided array are migrated.
 * It is not allowed to modify the order of the actions, to add an action or to remove an action.
 * To indicate that an action should be removed it can be replaced by `null`.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateActionsFunction = (
    initialState: object,
    actions: (object | null)[]
) => void;

/**
 * Such a function gets the not yet migrated state and is expected to return a migrated version of it.
 * It may throw a {@link RestoreError} when a migration is not possible.
 */
type MigrateStateFunction = (state: object) => object;

export interface Migration {
    actions: MigrateActionsFunction | null;
    state: MigrateStateFunction | null;
}

// TODO: It'd probably be better not to export this
export const migrations: {
    [key: number]: Migration;
} = {
    2: impossibleMigration,
    3: updateEocLog3,
    4: removeSetParticipantIdAction4,
    5: removeStatistics5,
};

export async function migrateInDatabaseTo(
    targetStateVersion: number,
    currentStateVersion: number,
    exerciseId: UUID,
    entityManager: EntityManager
): Promise<void> {
    const migrationFunctions = getMigrationFunctions(
        currentStateVersion,
        targetStateVersion
    );
    const stateMigrationFunctions = migrationFunctions.state;
    const originalStates = await entityManager.findOne(ExerciseWrapperEntity, {
        where: { id: exerciseId },
        select: { initialStateString: true, currentStateString: true },
    });
    if (originalStates === null) {
        throw new RestoreError(
            'Cannot find exercise to convert in database',
            exerciseId
        );
    }
    let initialState: object | null = null,
        currentState: object | null = null;
    if (stateMigrationFunctions.length > 0) {
        initialState = JSON.parse(originalStates.initialStateString);
        currentState = JSON.parse(originalStates.currentStateString);
        stateMigrationFunctions.forEach((stateMigrationFunction) => {
            initialState = stateMigrationFunction(initialState!);
            currentState = stateMigrationFunction(currentState!);
        });
    }
    const actionsMigrationFunctions = migrationFunctions.actions;
    let actions: (object | null)[] | null = null;
    if (actionsMigrationFunctions.length > 0) {
        const originalActions = await entityManager.find(ActionWrapperEntity, {
            where: { exercise: { id: exerciseId } },
            select: { actionString: true },
            order: { index: 'ASC' },
        });
        actions = originalActions.map((originalAction) =>
            JSON.parse(originalAction.actionString)
        );
        initialState ??= JSON.parse(originalStates.initialStateString);
        actionsMigrationFunctions.forEach((actionsMigrationFunction) => {
            actionsMigrationFunction(initialState!, actions!);
        });
    }
    const patch: Partial<ExerciseWrapperEntity> = {
        stateVersion: targetStateVersion,
    };
    if (currentState !== null) {
        patch.initialStateString = JSON.stringify(initialState);
        patch.currentStateString = JSON.stringify(currentState);
    }
    await entityManager.update(
        ExerciseWrapperEntity,
        { id: exerciseId },
        patch
    );
    if (actions !== null) {
        let patchedActionsIndex = 0;
        const indicesToRemove: number[] = [];
        const actionsToUpdate: { index: number; actionString: string }[] = [];
        actions.forEach((action, i) => {
            if (action === null) {
                indicesToRemove.push(i);
                return;
            }
            actionsToUpdate.push({
                index: patchedActionsIndex++,
                actionString: JSON.stringify(action),
            });
        });
        if (indicesToRemove.length > 0) {
            await entityManager
                .createQueryBuilder()
                .delete()
                .from(ActionWrapperEntity)
                // eslint-disable-next-line unicorn/string-content
                .where('index IN (:...ids)', { ids: indicesToRemove })
                .execute();
        }
        if (actionsToUpdate.length > 0) {
            await Promise.all(
                actionsToUpdate.map(async ({ index, actionString }) =>
                    entityManager.update(
                        ActionWrapperEntity,
                        { index },
                        { actionString }
                    )
                )
            );
        }
    }
}

export function migrateStateExportTo(
    targetStateVersion: number,
    currentStateVersion: number,
    stateExport: StateExport
): StateExport {
    const migrationFunctions = getMigrationFunctions(
        currentStateVersion,
        targetStateVersion
    );
    migrationFunctions.state.forEach((migrateStateFunction) => {
        stateExport.currentState = migrateStateFunction(
            stateExport.currentState
        ) as Mutable<ExerciseState>;
        if (stateExport.history) {
            stateExport.history.initialState = migrateStateFunction(
                stateExport.history.initialState
            ) as Mutable<ExerciseState>;
        }
    });
    if (stateExport.history) {
        migrationFunctions.actions.forEach((fn) => {
            fn(
                stateExport.history!.initialState,
                stateExport.history!.actionHistory
            );
        });
        stateExport.history.actionHistory =
            stateExport.history.actionHistory.filter(
                (action) => action !== null
            );
    }
    return stateExport;
}

function getMigrationFunctions(
    initialVersion: number,
    targetVersion: number
): { actions: MigrateActionsFunction[]; state: MigrateStateFunction[] } {
    const necessaryMigrations = Object.entries(migrations)
        .filter(
            ([key]) =>
                Number.parseInt(key) > initialVersion &&
                Number.parseInt(key) <= targetVersion
        )
        .map(([, migration]) => migration);
    return {
        actions: necessaryMigrations
            .filter((migration) => migration.actions !== null)
            .map((migration) => migration.actions) as MigrateActionsFunction[],
        state: necessaryMigrations
            .filter((thisFunctions) => thisFunctions.state !== null)
            .map(
                (thisFunctions) => thisFunctions.state
            ) as MigrateStateFunction[],
    };
}
