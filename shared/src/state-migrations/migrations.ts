import type { StateExport } from '../export-import/file-format';
import { ExerciseState } from '../state';
import type { ExerciseAction } from '../store';
import { applyAllActions } from '../store';
import type { Mutable } from '../utils';
import { cloneDeepMutable } from '../utils';
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
    for (let i = currentStateVersion + 1; i <= targetVersion; i++) {
        const stateMigration = migrations[i]!.state;
        if (stateMigration !== null) {
            if (propertiesToMigrate.history)
                stateMigration(propertiesToMigrate.history.initialState);
            else stateMigration(propertiesToMigrate.currentState);
        }
        if (!propertiesToMigrate.history) continue;
        const actionMigration = migrations[i]!.actions;
        if (actionMigration !== null) {
            actionMigration(
                propertiesToMigrate.history.initialState,
                propertiesToMigrate.history.actions
            );
        }
    }
    if (propertiesToMigrate.history)
        propertiesToMigrate.currentState = applyAllActions(
            propertiesToMigrate.history.initialState as ExerciseState,
            propertiesToMigrate.history.actions.filter(
                (action) => action !== null
            ) as ExerciseAction[]
        );
    return targetVersion;
}
