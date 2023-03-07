import type { StateExport } from '../export-import/file-format';
import { ExerciseState } from '../state';
import type { ExerciseAction } from '../store';
import { applyAction } from '../store';
import type { Mutable } from '../utils';
import { cloneDeepMutable } from '../utils';
import type { Migration } from './migration-functions';
import { migrations } from './migration-functions';

export function migrateStateExport(
    stateExportToMigrate: StateExport
): Mutable<StateExport> {
    const stateExport = cloneDeepMutable(stateExportToMigrate);
    const {
        newVersion,
        migratedProperties: { currentState, history },
    } = applyMigrations(stateExport.dataVersion, {
        currentState: stateExport.currentState,
        history: stateExport.history
            ? {
                  initialState: stateExport.history.initialState,
                  actions: stateExport.history.actionHistory,
              }
            : undefined,
    });
    stateExport.dataVersion = newVersion;
    stateExport.currentState = currentState;
    if (stateExport.history && history) {
        stateExport.history.actionHistory =
            // Remove actions that are marked to be removed by the migrations
            history.actions.filter(
                (action): action is Mutable<ExerciseAction> => action !== null
            );
    }
    return stateExport;
}

/**
 * Migrates {@link propertiesToMigrate} to the newest version ({@link ExerciseState.currentStateVersion})
 * Might mutate the input.
 * @returns The new state version
 */
export function applyMigrations<
    H extends { initialState: object; actions: (object | null)[] } | undefined
>(
    currentStateVersion: number,
    propertiesToMigrate: {
        currentState: object;
        history: H;
    }
): {
    newVersion: number;
    migratedProperties: {
        currentState: Mutable<ExerciseState>;
        history: H extends undefined
            ? undefined
            : {
                  initialState: Mutable<ExerciseState>;
                  actions: (Mutable<ExerciseAction> | null)[];
              };
    };
} {
    const newVersion = ExerciseState.currentStateVersion;

    const migrationsToApply: Migration[] = [];
    for (let i = currentStateVersion + 1; i <= newVersion; i++) {
        migrationsToApply.push(migrations[i]!);
    }

    const history = propertiesToMigrate.history;
    if (history) {
        migrateState(migrationsToApply, history.initialState);
        const intermediaryState = cloneDeepMutable(
            history.initialState
        ) as Mutable<ExerciseState>;
        history.actions.forEach((action, index) => {
            if (action !== null) {
                const deleteAction = !migrateAction(
                    migrationsToApply,
                    intermediaryState,
                    action
                );
                if (!deleteAction) {
                    applyAction(intermediaryState, action as ExerciseAction);
                } else {
                    history.actions[index] = null;
                }
            }
        });
        return {
            newVersion,
            migratedProperties: {
                currentState: intermediaryState,
                // history has been migrated in place
                history: history as any,
            },
        };
    }
    migrateState(migrationsToApply, propertiesToMigrate.currentState);
    const currentState =
        propertiesToMigrate.currentState as Mutable<ExerciseState>;
    return {
        newVersion,
        migratedProperties: {
            currentState,
            history: undefined as any,
        },
    };
}

function migrateState(migrationsToApply: Migration[], currentState: object) {
    migrationsToApply.forEach((migration) => {
        if (migration.state) migration.state(currentState);
    });
}

/**
 * @returns true if all went well and false if the action should be deleted
 */
function migrateAction(
    migrationsToApply: Migration[],
    intermediaryState: object,
    action: object
): boolean {
    return migrationsToApply.every((migration) => {
        if (migration.action) {
            return migration.action(intermediaryState, action);
        }
        return true;
    });
}
