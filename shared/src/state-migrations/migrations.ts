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
    const propertiesToMigrate = {
        currentState: stateExport.currentState,
        history: stateExport.history
            ? {
                  initialState: stateExport.history.initialState,
                  actions: stateExport.history.actionHistory,
              }
            : undefined,
    };
    const newVersion = applyMigrations(
        stateExport.dataVersion,
        propertiesToMigrate
    );
    stateExport.dataVersion = newVersion;
    stateExport.currentState = propertiesToMigrate.currentState;
    if (stateExport.history) {
        stateExport.history.actionHistory =
            // Remove actions that are marked to be removed by the migrations
            propertiesToMigrate.history!.actions.filter(
                (action) => action !== null
            );
    }
    return stateExport;
}

/**
 * Migrates {@link propertiesToMigrate} to the newest version ({@link ExerciseState.currentStateVersion})
 * by mutating them.
 *
 * @returns The new state version
 */
export function applyMigrations(
    currentStateVersion: number,
    propertiesToMigrate: {
        currentState: object;
        history?: { initialState: object; actions: (object | null)[] };
    }
): number {
    const targetVersion = ExerciseState.currentStateVersion;

    const migrationsToApply: Migration[] = [];
    for (let i = currentStateVersion + 1; i <= targetVersion; i++) {
        migrationsToApply.push(migrations[i]!);
    }

    const history = propertiesToMigrate.history;
    if (history) {
        const intermediaryState = history.initialState;
        migrateState(migrationsToApply, intermediaryState);
        history.actions.forEach((action, index) => {
            if (action !== null) {
                const deleteAction = !migrateAction(
                    migrationsToApply,
                    intermediaryState,
                    action
                );
                if (!deleteAction) {
                    applyAction(
                        intermediaryState as Mutable<ExerciseState>,
                        action as ExerciseAction
                    );
                } else {
                    history.actions[index] = null;
                }
            }
        });
    } else {
        migrateState(migrationsToApply, propertiesToMigrate.currentState);
    }
    return targetVersion;
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
